from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics, permissions, status
from rest_framework import serializers
import requests
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from .models import PokemonUsuario
from django.contrib.auth import get_user_model
from .serializers import RegisterSerializer, UserSerializer, PasswordResetRequestSerializer, PasswordResetConfirmSerializer

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
        favoritos = PokemonUsuario.objects.filter(usuario=usuario, favorito=True)
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
        usuario = request.user
        equipe = PokemonUsuario.objects.filter(usuario=usuario, grupo_batalha=True)
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


# ---------------------- RESET DE SENHA ----------------------
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

        # Link que o frontend usaria para reset
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
