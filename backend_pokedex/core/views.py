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
    """Busca lista e detalhes dos pokémons da PokeAPI"""
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
    imagem_url = (
        detalhe['sprites']['front_default']
        or f"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/{codigo}.png"
    )
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
            'stats_cache': stats_lista  # salva aqui
        }
    )

    # Atualiza tipos e stats caso já exista
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
# FAVORITOS
# ------------------------------------------------------------
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def favoritos_list(request):
    if request.method == 'GET':
        pokemons = PokemonUsuario.objects.filter(usuario=request.user, favorito=True)
        serializer = PokemonUsuarioSerializer(pokemons, many=True)
        return Response(serializer.data)

    data = request.data
    try:
        pokemon = PokemonUsuario.objects.get(usuario=request.user, nome=data['nome'])
        pokemon.favorito = not pokemon.favorito
        pokemon.save()
        serializer = PokemonUsuarioSerializer(pokemon)
        return Response(serializer.data)
    except PokemonUsuario.DoesNotExist:
        return Response({'error': 'Pokémon não encontrado'}, status=404)


# ------------------------------------------------------------
# GRUPO DE BATALHA
# ------------------------------------------------------------
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def batalha_list(request):
    if request.method == 'GET':
        pokemons = PokemonUsuario.objects.filter(usuario=request.user, grupo_batalha=True)
        serializer = PokemonUsuarioSerializer(pokemons, many=True)
        return Response(serializer.data)

    data = request.data
    try:
        pokemon = PokemonUsuario.objects.get(usuario=request.user, nome=data['nome'])
        if not pokemon.grupo_batalha:
            if PokemonUsuario.objects.filter(usuario=request.user, grupo_batalha=True).count() >= 6:
                return Response({'error': 'Máximo de 6 pokémons na equipe'}, status=400)
        pokemon.grupo_batalha = not pokemon.grupo_batalha
        pokemon.save()
        serializer = PokemonUsuarioSerializer(pokemon)
        return Response(serializer.data)
    except PokemonUsuario.DoesNotExist:
        return Response({'error': 'Pokémon não encontrado'}, status=404)


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
