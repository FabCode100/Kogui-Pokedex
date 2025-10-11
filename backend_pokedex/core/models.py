from django.db import models
from django.utils import timezone
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager


class UsuarioManager(BaseUserManager):
    def create_user(self, login, email, senha=None, **extra_fields):
        if not login:
            raise ValueError("O campo 'login' é obrigatório.")
        if not email:
            raise ValueError("O campo 'email' é obrigatório.")
        email = self.normalize_email(email)
        user = self.model(login=login, email=email, **extra_fields)
        user.set_password(senha)
        user.save(using=self._db)
        return user

    def create_superuser(self, login, email, senha=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if not senha:
            raise ValueError("Superusuário precisa de uma senha.")
        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superusuário precisa ter is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superusuário precisa ter is_superuser=True.")

        return self.create_user(login, email, senha, **extra_fields)


class Usuario(AbstractBaseUser, PermissionsMixin):
    id_usuario = models.AutoField(primary_key=True)
    nome = models.CharField(max_length=100)
    login = models.CharField(max_length=50, unique=True)
    email = models.EmailField(unique=True)
    dt_inclusao = models.DateTimeField(default=timezone.now)
    dt_alteracao = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    USERNAME_FIELD = "login"
    REQUIRED_FIELDS = ["email"]

    objects = UsuarioManager()

    def __str__(self):
        return self.login

    @property
    def id(self):
        return self.id_usuario


class TipoPokemon(models.Model):
    id_tipo_pokemon = models.AutoField(primary_key=True)
    descricao = models.CharField(max_length=50)

    def __str__(self):
        return self.descricao


class PokemonUsuario(models.Model):
    id_pokemon_usuario = models.AutoField(primary_key=True)
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name="pokemons")
    tipos = models.ManyToManyField(TipoPokemon, related_name="pokemons")
    codigo = models.CharField(max_length=50)
    nome = models.CharField(max_length=100)
    imagem_url = models.URLField()
    grupo_batalha = models.BooleanField(default=False)
    favorito = models.BooleanField(default=False)
    geracao = models.IntegerField(default=1) 

    def __str__(self):
        return self.nome
