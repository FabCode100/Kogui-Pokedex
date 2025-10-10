import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', redirectTo: '/pokemons', pathMatch: 'full' },
    { path: 'pokemons', loadComponent: () => import('./pages/pokedex/pokedex.component').then(m => m.PokedexComponent) },
    { path: 'favoritos', loadComponent: () => import('./pages/favoritos/favoritos.component').then(m => m.FavoritosComponent) },
    { path: 'batalha', loadComponent: () => import('./pages/batalha/batalha.component').then(m => m.BatalhaComponent) },
    { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
    { path: 'register', loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent) },
    { path: '**', redirectTo: '/pokemons', pathMatch: 'full' }
];