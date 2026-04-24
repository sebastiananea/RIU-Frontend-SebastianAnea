import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Hero } from '../models/hero.model';

@Injectable({ providedIn: 'root' })
export class HeroService {
  private readonly http = inject(HttpClient);

  private readonly _heroes = signal<Hero[]>([]);
  private readonly _searchTerm = signal<string>('');

  readonly heroes = this._heroes.asReadonly();
  readonly searchTerm = this._searchTerm.asReadonly();

  readonly filteredHeroes = computed(() => {
    const term = this._searchTerm().toLowerCase().trim();
    if (!term) {
      return this._heroes();
    }
    return this._heroes().filter(
      (h) =>
        h.name.toLowerCase().includes(term) ||
        h.alias.toLowerCase().includes(term) ||
        h.universe.toLowerCase().includes(term),
    );
  });

  constructor() {
    this.loadHeroes();
  }

  private loadHeroes(): void {
    this.http.get<Hero[]>('/api/heroes').subscribe((heroes) => {
      this._heroes.set(heroes);
    });
  }

  getById(id: number): Hero | undefined {
    return this._heroes().find((h) => h.id === id);
  }

  search(term: string): void {
    this._searchTerm.set(term);
  }

  add(hero: Omit<Hero, 'id' | 'createdAt'>): Observable<Hero> {
    return this.http.post<Hero>('/api/heroes', hero).pipe(
      tap((newHero) => this._heroes.update((heroes) => [...heroes, newHero]))
    );
  }

  update(id: number, changes: Partial<Omit<Hero, 'id' | 'createdAt'>>): Observable<Hero> {
    return this.http.patch<Hero>(`/api/heroes/${id}`, changes).pipe(
      tap((updatedHero) => {
        this._heroes.update((heroes) =>
          heroes.map((h) => (h.id === id ? updatedHero : h))
        );
      })
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`/api/heroes/${id}`).pipe(
      tap(() => this._heroes.update((heroes) => heroes.filter((h) => h.id !== id)))
    );
  }
}

