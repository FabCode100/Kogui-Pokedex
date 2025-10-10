from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics, permissions, status
import requests
from .models import PokemonUsuario, Usuario
from django.contrib.auth import get_user_model
from .serializers import RegisterSerializer, UserSerializer


# ---------------------- LISTAGEM DE POKÉMONS ----------------------
class PokemonListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        response = requests.get('https://pokeapi.co/api/v2/pokemon?limit=20')
        data = response.json()
        return Response(data['results'])


# ---------------------- FAVORITOS ----------------------
class FavoritosView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        usuario = request.user
        favoritos = PokemonUsuario.objects.filter(usuario__id_usuario=usuario.id_usuario, favorito=True)
        data = [{"nome": p.nome, "imagem": p.imagem_url} for p in favoritos]
        return Response(data)

    def post(self, request):
        usuario = request.user
        nome = request.data.get("nome")
        imagem_url = request.data.get("imagem_url")
        favorito = request.data.get("favorito", True)

        if not nome or not imagem_url:
            return Response(
                {"detail": "Campos 'nome' e 'imagem_url' são obrigatórios."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Cria ou atualiza o Pokémon favorito
        pokemon, created = PokemonUsuario.objects.get_or_create(
            usuario=usuario,
            nome=nome,
            defaults={"imagem_url": imagem_url, "favorito": favorito}
        )

        if not created:
            pokemon.favorito = favorito
            pokemon.imagem_url = imagem_url
            pokemon.save()

        msg = "Adicionado aos favoritos!" if favorito else "Removido dos favoritos!"
        return Response({"nome": pokemon.nome, "favorito": pokemon.favorito, "mensagem": msg})


# ---------------------- EQUIPE DE BATALHA ----------------------
class EquipeBatalhaView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        equipe = PokemonUsuario.objects.filter(usuario=request.user, grupo_batalha=True)
        data = [{"nome": p.nome, "imagem": p.imagem_url} for p in equipe]
        return Response(data)

    def post(self, request):
        usuario = request.user
        nome = request.data.get("nome")
        imagem_url = request.data.get("imagem_url")
        grupo_batalha = request.data.get("grupo_batalha", True)

        if not nome or not imagem_url:
            return Response(
                {"detail": "Campos 'nome' e 'imagem_url' são obrigatórios."},
                status=status.HTTP_400_BAD_REQUEST
            )

        pokemon, created = PokemonUsuario.objects.get_or_create(
            usuario=usuario,
            nome=nome,
            defaults={"imagem_url": imagem_url, "grupo_batalha": grupo_batalha}
        )

        if not created:
            pokemon.grupo_batalha = grupo_batalha
            pokemon.imagem_url = imagem_url
            pokemon.save()

        msg = "Adicionado à equipe de batalha!" if grupo_batalha else "Removido da equipe!"
        return Response({"nome": pokemon.nome, "grupo_batalha": pokemon.grupo_batalha, "mensagem": msg})


# ---------------------- USUÁRIOS ----------------------
User = get_user_model()


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class ProfileView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user
