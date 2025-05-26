// src/app/app.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterService } from './services/filter.service';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    CommonModule,
    FormsModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'MannyMaquinarias-frontend';
  currentYear: number = new Date().getFullYear();
  globalSearchTerm: string = '';

  showSuggestions: boolean = false;
  allPossibleSuggestions: string[] = [
    'Retrocargadora', 'Minicargadora', 'Compactadora', 'Plataforma Elevadora',
    'Caterpillar', 'Bobcat', 'Dynapac', 'Komatsu', 'John Deere',
    'Quilmes', 'Bernal', 'Florencio Varela', 'La Plata', 'Avellaneda',
    'Retroexcavadora', 'Excavadora', 'Grúa', 'Montacargas'
  ];
  filteredSuggestions: string[] = [];
  searchHistory: string[] = [];

  private searchInputSubject = new Subject<string>();
  private subscriptions: Subscription = new Subscription();

  constructor(
    private filterService: FilterService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Suscripción para debouncar la lógica de SUGERENCIAS, no la búsqueda del catálogo.
    this.subscriptions.add(
      this.searchInputSubject.pipe(
        debounceTime(300),
        distinctUntilChanged()
      ).subscribe(term => {
        this.updateSuggestions(term); // Solo actualiza las sugerencias
      })
    );

    this.loadSearchHistory();

    // Este se mantiene por si el catálogo setea el término (ej: al limpiar filtros internos)
    this.subscriptions.add(
      this.filterService.searchTerm$.subscribe(term => {
        if (term !== this.globalSearchTerm) {
          this.globalSearchTerm = term;
          this.updateSuggestions(term);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // Se llama en cada evento de input del campo de búsqueda
  onSearchInput(event: Event): void { // ¡CAMBIO AQUÍ! RECIBE EL EVENTO COMPLETO
    const inputElement = event.target as HTMLInputElement; // Casteo seguro
    const term = inputElement.value; // Acceso al valor

    this.searchInputSubject.next(term); // Notifica al Subject para actualizar sugerencias
    this.showSuggestions = true; // Asegura que las sugerencias se muestren al escribir
  }

  executeSearch(): void {
    const termToSearch = this.globalSearchTerm.trim();
    if (termToSearch.length > 0) {
      this.filterService.setSearchTerm(termToSearch);
      this.addSearchToHistory(termToSearch);
      this.showSuggestions = false;

      if (this.router.url !== '/catalogo') {
        this.router.navigate(['/catalogo']);
      }
    } else {
      this.filterService.setSearchTerm('');
      this.showSuggestions = false;
    }
  }

  updateSuggestions(term: string): void {
    if (term.length > 0) {
      const lowerCaseTerm = term.toLowerCase();
      this.filteredSuggestions = this.allPossibleSuggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(lowerCaseTerm) &&
        !this.searchHistory.some(historyItem => historyItem.toLowerCase() === suggestion.toLowerCase())
      ).slice(0, 5);
    } else {
      this.filteredSuggestions = [];
    }
  }

  selectSuggestion(suggestion: string, event?: MouseEvent): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.globalSearchTerm = suggestion;
    this.executeSearch();
  }

  clearGlobalSearch(event?: MouseEvent): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.globalSearchTerm = '';
    this.filterService.setSearchTerm('');
    this.filteredSuggestions = [];
    this.showSuggestions = false;
  }

  private addSearchToHistory(term: string): void {
    if (term.trim() === '') return;

    this.searchHistory = this.searchHistory.filter(item => item.toLowerCase() !== term.toLowerCase());
    this.searchHistory.unshift(term);

    if (this.searchHistory.length > 5) {
      this.searchHistory = this.searchHistory.slice(0, 5);
    }
    this.saveSearchHistory();
  }

  private saveSearchHistory(): void {
    try {
      localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));
    } catch (e) {
      console.error('Error al guardar el historial de búsqueda en localStorage', e);
    }
  }

  private loadSearchHistory(): void {
    try {
      const history = localStorage.getItem('searchHistory');
      if (history) {
        this.searchHistory = JSON.parse(history);
      }
    } catch (e) {
      console.error('Error al cargar el historial de búsqueda de localStorage', e);
    }
  }

  removeHistoryItem(term: string, event?: MouseEvent): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.searchHistory = this.searchHistory.filter(item => item !== term);
    this.saveSearchHistory();
    if (this.globalSearchTerm === term) {
        this.globalSearchTerm = '';
        this.filterService.setSearchTerm('');
    }
    this.showSuggestions = true;
    this.updateSuggestions(this.globalSearchTerm);
  }

  hideSuggestions(): void {
    setTimeout(() => {
      this.showSuggestions = false;
    }, 150);
  }
}