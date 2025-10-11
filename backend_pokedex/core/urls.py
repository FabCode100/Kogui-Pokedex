from django.urls import path
from . import views
from .views import (
    RegisterView,
    ProfileView,
    PasswordResetRequestView,
    PasswordResetConfirmView
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    # JWT
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Cadastro e perfil
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('profile/', ProfileView.as_view(), name='auth_profile'),

    # Pokémons
    path('pokemons/', views.pokemons_list),
    path('favoritos/', views.favoritos_list),
    path('batalha/', views.batalha_list),

    # Reset de senha
    path('reset-password/', PasswordResetRequestView.as_view(), name='reset-password'),
    path('reset-password-confirm/<uidb64>/<token>/', PasswordResetConfirmView.as_view(), name='reset-password-confirm'),
]
