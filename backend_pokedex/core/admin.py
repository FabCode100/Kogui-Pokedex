from django.contrib import admin
from .models import Usuario, TipoPokemon, PokemonUsuario
from django.contrib.auth.admin import UserAdmin

class UsuarioAdmin(UserAdmin):
    model = Usuario
    list_display = ("id_usuario", "nome", "login", "email", "is_staff", "is_active")
    list_filter = ("is_staff", "is_active")
    fieldsets = (
        (None, {"fields": ("login", "email", "senha")}),
        ("Informações pessoais", {"fields": ("nome",)}),
        ("Permissões", {"fields": ("is_staff", "is_active", "is_superuser", "groups", "user_permissions")}),
        ("Datas", {"fields": ("last_login", "dt_inclusao", "dt_alteracao")}),
    )
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("login", "email", "senha", "is_staff", "is_active"),
        }),
    )
    search_fields = ("email", "login")
    ordering = ("id_usuario",)

admin.site.register(Usuario, UsuarioAdmin)
admin.site.register(TipoPokemon)
admin.site.register(PokemonUsuario)
