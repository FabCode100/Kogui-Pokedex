import asyncio
import aiohttp
from asgiref.sync import sync_to_async
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.core.cache import cache
import requests 


from .models import PokemonUsuario, TipoPokemon
from .serializers import (
    RegisterSerializer, UserSerializer,
    PasswordResetRequestSerializer, PasswordResetConfirmSerializer,
    PokemonUsuarioSerializer
)

User = get_user_model()


# ------------------------------------------------------------
# FUNÇÕES ASYNC DE BUSCA DE DADOS
# ------------------------------------------------------------
async def fetch_json(session, url):
    try:
        async with session.get(url, timeout=10) as resp:
            if resp.status != 200:
                return None
            return await resp.json()
    except Exception as e:
        print(f"Erro ao acessar {url}: {e}")
        return None


async def fetch_pokemons_data(limit=30):
    async with aiohttp.ClientSession() as session:
        main_url = f"https://pokeapi.co/api/v2/pokemon?limit={limit}"
        main_data = await fetch_json(session, main_url)
        if not main_data:
            return []

        tasks = [fetch_json(session, p['url']) for p in main_data.get('results', [])]
        detalhes = await asyncio.gather(*tasks)
        return [d for d in detalhes if d]


# ------------------------------------------------------------
# SALVAR POKÉMON NO BANCO
# ------------------------------------------------------------
async def sync_pokemon_to_db(user, detalhe):
    nome = detalhe['name']
    codigo = detalhe['id']
    imagem_url = detalhe['sprites']['front_default'] or f"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/{codigo}.png"
    tipos_lista = [t['type']['name'] for t in detalhe['types']]
    stats_lista = {s['stat']['name']: s['base_stat'] for s in detalhe['stats']}

    pokemon_obj, created = await sync_to_async(PokemonUsuario.objects.get_or_create)(
        usuario=user,
        nome=nome,
        defaults={
            'codigo': codigo,
            'imagem_url': imagem_url,
            'favorito': False,
            'grupo_batalha': False,
            'stats_cache': stats_lista
        }
    )

    # Atualiza tipos caso já exista
    for tipo in tipos_lista:
        tipo_obj, _ = await sync_to_async(TipoPokemon.objects.get_or_create)(descricao=tipo)
        await sync_to_async(pokemon_obj.tipos.add)(tipo_obj)

    if not created:
        pokemon_obj.codigo = codigo
        pokemon_obj.imagem_url = imagem_url
        pokemon_obj.stats_cache = stats_lista
        await sync_to_async(pokemon_obj.save)()

    return {
        "codigo": codigo,
        "nome": nome,
        "imagem_url": imagem_url,
        "tipos": [{"descricao": t} for t in tipos_lista],
        "stats": stats_lista,
    }


# ------------------------------------------------------------
# CALCULA GERAÇÃO
# ------------------------------------------------------------
def calcular_geracao(pokemon_id):
    if pokemon_id <= 151: return 1
    if pokemon_id <= 251: return 2
    if pokemon_id <= 386: return 3
    if pokemon_id <= 493: return 4
    if pokemon_id <= 649: return 5
    if pokemon_id <= 721: return 6
    if pokemon_id <= 809: return 7
    if pokemon_id <= 905: return 8
    return 9


# ------------------------------------------------------------
# FETCH EVOLUTION CHAIN (async)
# ------------------------------------------------------------
async def get_evolution_chain(session, pokemon_id):
    species_url = f"https://pokeapi.co/api/v2/pokemon-species/{pokemon_id}/"
    species_data = await fetch_json(session, species_url)
    if not species_data or 'evolution_chain' not in species_data:
        return []

    evo_url = species_data['evolution_chain']['url']
    evo_data = await fetch_json(session, evo_url)
    if not evo_data:
        return []

    chain = []

    async def parse_chain(node):
        nome = node['species']['name']
        poke_data = await fetch_json(session, f"https://pokeapi.co/api/v2/pokemon/{nome}/")
        imagem = poke_data['sprites']['front_default'] if poke_data else None
        chain.append({"nome": nome, "imagem_url": imagem})
        for evo in node.get("evolves_to", []):
            await parse_chain(evo)

    await parse_chain(evo_data['chain'])
    return chain


# ------------------------------------------------------------
# LISTAR / SINCRONIZAR POKÉMONS
# ------------------------------------------------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def pokemons_list(request):
    user = request.user
    pokemons_existentes = PokemonUsuario.objects.filter(usuario=user)

    if pokemons_existentes.exists():
        serializer = PokemonUsuarioSerializer(pokemons_existentes, many=True)
        return Response(serializer.data)

    async def main():
        detalhes = await fetch_pokemons_data(limit=30)
        tasks = [sync_pokemon_to_db(user, d) for d in detalhes]
        return await asyncio.gather(*tasks)

    pokemons_detalhados = asyncio.run(main())
    return Response(pokemons_detalhados)


# ------------------------------------------------------------
# DETALHE DO POKÉMON (busca + salva)
# ------------------------------------------------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def pokemon_detalhe(request, pokemon_id):
    from .models import PokemonDetalhe
    # 1️⃣ Checa se já existe no banco
    detalhe_existente = PokemonDetalhe.objects.filter(codigo=pokemon_id).first()
    if detalhe_existente:
        return Response({
            "codigo": detalhe_existente.codigo,
            "nome": detalhe_existente.nome,
            "imagem_url": detalhe_existente.imagem_url,
            "tipos": detalhe_existente.tipos,
            "status": detalhe_existente.status,
            "habilidades": detalhe_existente.habilidades,
            "movimentos": detalhe_existente.movimentos,
            "sprites": detalhe_existente.sprites,
            "evolutionChain": detalhe_existente.evolution_chain,
            "geracao": detalhe_existente.geracao
        })

    # 2️⃣ Se não existe, busca da PokeAPI e salva
    async def main():
        async with aiohttp.ClientSession() as session:
            data_pokemon = await fetch_json(session, f"https://pokeapi.co/api/v2/pokemon/{pokemon_id}/")
            if not data_pokemon:
                return None

            evolution_chain = await get_evolution_chain(session, pokemon_id)

            return {
                "codigo": data_pokemon['id'],
                "nome": data_pokemon['name'],
                "imagem_url": data_pokemon['sprites']['front_default'],
                "tipos": [{"descricao": t['type']['name']} for t in data_pokemon.get('types', [])],
                "status": [{"nome": s['stat']['name'], "valor": s['base_stat']} for s in data_pokemon.get('stats', [])],
                "habilidades": [{"nome": h['ability']['name']} for h in data_pokemon.get('abilities', [])],
                "movimentos": [{"nome": m['move']['name']} for m in data_pokemon.get('moves', [])],
                "sprites": [s for s in data_pokemon['sprites'].values() if isinstance(s, str)],
                "evolutionChain": evolution_chain,
                "geracao": calcular_geracao(data_pokemon["id"])
            }

    result = asyncio.run(main())

    if result:
        # salva no banco
        PokemonDetalhe.objects.create(
            codigo=result["codigo"],
            nome=result["nome"],
            imagem_url=result["imagem_url"],
            tipos=result["tipos"],
            status=result["status"],
            habilidades=result["habilidades"],
            movimentos=result["movimentos"],
            sprites=result["sprites"],
            evolution_chain=result["evolutionChain"],
            geracao=result["geracao"]
        )
        return Response(result)

    return Response({"error": "Pokémon não encontrado"}, status=404)

# ------------------------------------------------------------
# FAVORITOS
# ------------------------------------------------------------
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import PokemonUsuario
from .serializers import PokemonUsuarioSerializer

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def favoritos_list(request):
    user = request.user

    if request.method == 'GET':
        pokemons = PokemonUsuario.objects.filter(usuario=user, favorito=True)
        serializer = PokemonUsuarioSerializer(pokemons, many=True)
        print("[DEBUG] GET /favoritos ->", serializer.data)
        return Response(serializer.data)

    # POST: alterna favorito
    data = request.data  # <- JSON enviado pelo Angular
    print("[DEBUG] POST /favoritos data recebida:", data)

    nome = data.get('nome')
    if not nome:
        return Response({'error': 'Campo "nome" obrigatório'}, status=400)

    try:
        pokemon = PokemonUsuario.objects.get(usuario=user, nome=nome)

        # Se vier "favorito" no body, usa o valor; senão alterna
        favorito_atual = data.get('favorito')
        if favorito_atual is not None:
            # Converte qualquer valor para boolean
            if isinstance(favorito_atual, str):
                favorito_atual = favorito_atual.lower() == 'true'
            elif isinstance(favorito_atual, int):
                favorito_atual = bool(favorito_atual)

            pokemon.favorito = favorito_atual
            print(f"[DEBUG] POST /favoritos -> favorito definido pelo body: {favorito_atual}")
        else:
            pokemon.favorito = not pokemon.favorito
            print(f"[DEBUG] POST /favoritos -> favorito alternado: {pokemon.favorito}")

        pokemon.save()
        serializer = PokemonUsuarioSerializer(pokemon)
        print(f"[DEBUG] POST /favoritos -> Pokémon salvo: {serializer.data}")
        return Response(serializer.data)

    except PokemonUsuario.DoesNotExist:
        print(f"[DEBUG] POST /favoritos -> Pokémon '{nome}' não encontrado para o usuário {user}")
        return Response({'error': 'Pokémon não encontrado'}, status=404)

# ------------------------------------------------------------
# GRUPO DE BATALHA
# ------------------------------------------------------------
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def batalha_list(request):
    user = request.user

    if request.method == 'GET':
        # Retorna os pokémons atualmente no grupo de batalha
        pokemons = PokemonUsuario.objects.filter(usuario=user, grupo_batalha=True)
        serializer = PokemonUsuarioSerializer(pokemons, many=True)
        return Response(serializer.data)

    # POST → adicionar ou remover do grupo de batalha
    data = request.data
    nome = data.get('nome')
    if not nome:
        return Response({'error': 'Nome do Pokémon não fornecido'}, status=400)

    try:
        pokemon = PokemonUsuario.objects.get(usuario=user, nome=nome)
    except PokemonUsuario.DoesNotExist:
        return Response({'error': 'Pokémon não encontrado'}, status=404)

    # Lógica do botão híbrido
    if not pokemon.grupo_batalha:
        # Adicionando ao grupo → verifica limite de 6
        if PokemonUsuario.objects.filter(usuario=user, grupo_batalha=True).count() >= 6:
            return Response({'error': 'Máximo de 6 pokémons na equipe'}, status=400)
        pokemon.grupo_batalha = True
    else:
        # Removendo do grupo
        pokemon.grupo_batalha = False

    pokemon.save()
    serializer = PokemonUsuarioSerializer(pokemon)
    return Response(serializer.data)

# ------------------------------------------------------------
# AUTENTICAÇÃO / PERFIL
# ------------------------------------------------------------
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class ProfileView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


# ------------------------------------------------------------
# RESET DE SENHA
# ------------------------------------------------------------
class PasswordResetRequestView(APIView):
    permission_classes = []

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"detail": "Usuário não encontrado."}, status=status.HTTP_404_NOT_FOUND)

        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        reset_link = f"http://localhost:4200/reset-password-confirm/{uid}/{token}/"

        send_mail(
            "Reset de senha",
            f"Clique aqui para resetar sua senha: {reset_link}",
            "webmaster@localhost",
            [user.email],
            fail_silently=False
        )
        return Response({"detail": "Email de reset enviado!"}, status=status.HTTP_200_OK)


class PasswordResetConfirmView(APIView):
    permission_classes = []

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        uid = serializer.validated_data['uidb64']
        token = serializer.validated_data['token']
        new_password = serializer.validated_data['new_password']

        try:
            uid = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({"detail": "Token inválido."}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            return Response({"detail": "Token inválido ou expirado."}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        return Response({"detail": "Senha alterada com sucesso!"}, status=status.HTTP_200_OK)
