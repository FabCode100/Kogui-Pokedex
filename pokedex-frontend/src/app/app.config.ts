import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, Route } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

const routes: Route[] = [
  { path: '', redirectTo: '/pokemons', pathMatch: 'full' },
  { path: 'pokemons', loadComponent: () => import('./pages/pokedex/pokedex.component').then(m => m.PokedexComponent) },
  { path: 'favoritos', loadComponent: () => import('./pages/favoritos/favoritos.component').then(m => m.FavoritosComponent) },
  { path: 'batalha', loadComponent: () => import('./pages/batalha/batalha.component').then(m => m.BatalhaComponent) },
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent) },
  { path: 'reset-password', loadComponent: () => import('./pages/reset-password/reset-password.component').then(m => m.ResetPasswordComponent) },
  {
    path: 'reset-password-confirm/:uidb64/:token',
    loadComponent: () => import('./pages/reset-password-confirm/reset-password-confirm.component')
      .then(m => m.ResetPasswordConfirmComponent)
  },

  { path: '**', redirectTo: '/pokemons', pathMatch: 'full' }
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi())
  ]
};
