// src/app/app.component.ts
import {
  Component,
  OnInit,
  OnDestroy,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription, Observable } from 'rxjs'; // Importa Observable
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { FilterService } from '../services/filter.service';
import { AuthService } from '../services/auth.service'; // <--- Importa AuthService
import { AsyncPipe } from '@angular/common'; // <--- Importa AsyncPipe para usar | async

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    CommonModule,
    FormsModule,
    AsyncPipe, // <--- Añade AsyncPipe a los imports
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Manny Maquinarias';
  currentYear: number = new Date().getFullYear();
  globalSearchTerm: string = '';

  showSuggestions: boolean = false;
  allPossibleSuggestions: string[] = [
    'Retrocargadora',
    'Minicargadora',
    'Compactadora',
    'Plataforma Elevadora',
    'Caterpillar',
    'Bobcat',
    'Dynapac',
    'Komatsu',
    'John Deere',
    'Quilmes',
    'Bernal',
    'Florencio Varela',
    'La Plata',
    'Avellaneda',
    'Retroexcavadora',
    'Excavadora',
    'Grúa',
    'Montacargas',
  ];
  filteredSuggestions: string[] = [];
  searchHistory: string[] = [];

  private searchInputSubject = new Subject<string>();
  private subscriptions: Subscription = new Subscription();

  isLoggedIn$: Observable<boolean>; // <--- Declara el Observable para el estado de login

  constructor(
    private filterService: FilterService,
    private router: Router,
    private authService: AuthService, // <--- Inyecta AuthService
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isLoggedIn$ = this.authService.isLoggedIn$; // <--- Inicializa el observable
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.searchInputSubject
        .pipe(debounceTime(300), distinctUntilChanged())
        .subscribe((term) => {
          this.updateSuggestions(term);
        })
    );

    this.loadSearchHistory();

    this.subscriptions.add(
      this.filterService.searchTerm$.subscribe((term) => {
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

  onSearchInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const term = inputElement.value;
    this.searchInputSubject.next(term);
    this.showSuggestions = true;
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
      this.filteredSuggestions = this.allPossibleSuggestions
        .filter(
          (suggestion) =>
            suggestion.toLowerCase().includes(lowerCaseTerm) &&
            !this.searchHistory.some(
              (historyItem) =>
                historyItem.toLowerCase() === suggestion.toLowerCase()
            )
        )
        .slice(0, 5);
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

    this.searchHistory = this.searchHistory.filter(
      (item) => item.toLowerCase() !== term.toLowerCase()
    );
    this.searchHistory.unshift(term);

    if (this.searchHistory.length > 5) {
      this.searchHistory = this.searchHistory.slice(0, 5);
    }
    this.saveSearchHistory();
  }

  private saveSearchHistory(): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.setItem(
          'searchHistory',
          JSON.stringify(this.searchHistory)
        );
      } catch (e) {
        console.error(
          'Error al guardar el historial de búsqueda en localStorage',
          e
        );
      }
    }
  }

  private loadSearchHistory(): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const history = localStorage.getItem('searchHistory');
        if (history) {
          this.searchHistory = JSON.parse(history);
        }
      } catch (e) {
        console.error(
          'Error al cargar el historial de búsqueda de localStorage',
          e
        );
      }
    }
  }

  removeHistoryItem(term: string, event?: MouseEvent): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.searchHistory = this.searchHistory.filter((item) => item !== term);
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

  // <--- Nuevo método para el cierre de sesión
  logout(): void {
    this.authService.logout();
  }
}
