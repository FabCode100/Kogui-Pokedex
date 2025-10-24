from rest_framework import serializers
from .models import Usuario, PokemonUsuario, TipoPokemon

import requests

class TipoPokemonSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoPokemon
        fields = ['descricao']


class PokemonUsuarioSerializer(serializers.ModelSerializer):
    tipos = TipoPokemonSerializer(many=True, read_only=True)
    stats = serializers.SerializerMethodField()  # <-- novo campo

    class Meta:
        model = PokemonUsuario
        fields = [
            'codigo', 'nome', 'imagem_url', 
            'tipos', 'favorito', 'grupo_batalha', 'geracao', 'stats'
        ]

    def get_stats(self, obj):
        return obj.stats_cache or {}


        
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Usuario
        fields = ['id_usuario', 'nome', 'login', 'email', 'password']

    def create(self, validated_data):
        password = validated_data.pop('password')
        usuario = Usuario(**validated_data)
        usuario.set_password(password)  # usa o método do AbstractBaseUser
        usuario.save()
        return usuario

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id_usuario', 'nome', 'login', 'email']
        
class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

class PasswordResetConfirmSerializer(serializers.Serializer):
    uidb64 = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(min_length=8)
