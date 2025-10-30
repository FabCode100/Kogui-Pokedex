import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AuthGuard } from './core/guards/auth.guard'; // importe seu guard

export const routes: Routes = [
    { path: '', component: HomeComponent },

    {
        path: 'pokemons',
        loadComponent: () => import('./pages/pokedex/pokedex.component').then(m => m.PokedexComponent),
        canActivate: [AuthGuard] // <-- aqui entra o guard
    },
    {
        path: 'favoritos',
        loadComponent: () => import('./pages/favoritos/favoritos.component').then(m => m.FavoritosComponent),
        canActivate: [AuthGuard] // proteger favoritos também
    },
    {
        path: 'batalha',
        loadComponent: () => import('./pages/batalha/batalha.component').then(m => m.BatalhaComponent),
        canActivate: [AuthGuard] // proteger batalha
    },
    { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
    { path: 'register', loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent) },
    {
        path: 'reset-password-confirm/:uidb64/:token',
        loadComponent: () => import('./pages/reset-password-confirm/reset-password-confirm.component')
            .then(m => m.ResetPasswordConfirmComponent)
    },
    { path: 'reset-password', loadComponent: () => import('./pages/reset-password/reset-password.component').then(m => m.ResetPasswordComponent) },
    { path: '**', redirectTo: '' },
];
