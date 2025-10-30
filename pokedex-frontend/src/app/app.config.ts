import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, Route } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HomeComponent } from './pages/home/home.component';
import { AuthGuard } from './core/guards/auth.guard'; // importe seu guard

const routes: Route[] = [
  { path: '', component: HomeComponent },
  {
    path: 'pokemons',
    loadComponent: () => import('./pages/pokedex/pokedex.component').then(m => m.PokedexComponent),
    canActivate: [AuthGuard] // protege a Pokedex
  },
  {
    path: 'favoritos',
    loadComponent: () => import('./pages/favoritos/favoritos.component').then(m => m.FavoritosComponent),
    canActivate: [AuthGuard] // protege favoritos
  },
  {
    path: 'batalha',
    loadComponent: () => import('./pages/batalha/batalha.component').then(m => m.BatalhaComponent),
    canActivate: [AuthGuard] // protege batalha
  },
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent) },
  { path: 'reset-password', loadComponent: () => import('./pages/reset-password/reset-password.component').then(m => m.ResetPasswordComponent) },
  {
    path: 'reset-password-confirm/:uidb64/:token',
    loadComponent: () => import('./pages/reset-password-confirm/reset-password-confirm.component')
      .then(m => m.ResetPasswordConfirmComponent)
  },
  { path: '**', redirectTo: '' },
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi())
  ]
};
