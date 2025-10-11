from django.urls import path
from . import views
from .views import (
    RegisterView,
    ProfileView,
    PasswordResetRequestView,      #
    PasswordResetConfirmView      
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    # Autenticação via JWT (token / refresh)
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Cadastro e perfil
    path('register/', views.RegisterView.as_view(), name='auth_register'),
    path('profile/', views.ProfileView.as_view(), name='auth_profile'),

    # seu endpoint pokemons, favoritos, batalha já mencionados
    path('pokemons/', views.PokemonListView.as_view(), name='pokemons'),
    path('favoritos/', views.FavoritosView.as_view(), name='favoritos'),
    path('batalha/', views.EquipeBatalhaView.as_view(), name='batalha'),
    path('reset-password/', PasswordResetRequestView.as_view(), name='reset-password'),
    path('reset-password-confirm/', PasswordResetConfirmView.as_view(), name='reset-password-confirm'),
]
