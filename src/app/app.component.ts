// src/app/app.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Para directivas comunes como ngIf, ngFor si las usas
import { RouterOutlet, RouterLink } from '@angular/router'; // Para que el router-outlet y routerLink funcionen

@Component({
  selector: 'app-root',
  standalone: true, // Esto ya lo tienes de tu base
  imports: [
    CommonModule,
    RouterOutlet, // Permite que <router-outlet> funcione
    RouterLink // Permite que routerLink="" funcione en el HTML
    // Aquí importarás otros componentes standalone que uses directamente en este template,
    // como los futuros HeaderComponent y FooterComponent.
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'MannyMaquinarias';
  currentYear: number = new Date().getFullYear(); // Para mostrar el año actual en el pie de página
}