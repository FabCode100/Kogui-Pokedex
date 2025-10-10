import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'navbar',
  template: `
    <mat-toolbar color="primary">
      <button mat-button routerLink="/pokemons">Pokemons</button>
      <button mat-button routerLink="/favoritos">Favoritos</button>
      <button mat-button routerLink="/batalha">Batalha</button>
      <button mat-button routerLink="/login">Login</button>
      <button mat-button routerLink="/register">Registrar</button>
    </mat-toolbar>
  `,
  styleUrls: ['./navbar.component.scss'],
  standalone: true,
  imports: [RouterModule, MatToolbarModule, MatButtonModule]
})
export class NavbarComponent { }
