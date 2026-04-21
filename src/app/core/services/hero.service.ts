import { Injectable, computed, signal } from '@angular/core';
import { Observable, defer, delay, map, of, tap } from 'rxjs';
import { Hero } from '../models/hero.model';

const SIMULATED_DELAY_MS = 500;

//Mock data for initial heroes.
const INITIAL_HEROES: Hero[] = [
  {
    id: 1,
    name: 'SUPERMAN',
    alias: 'Clark Kent',
    powers: ['Super strength', 'Flight', 'Heat vision'],
    universe: 'DC',
    createdAt: new Date('2000-01-01'),
  },
  {
    id: 2,
    name: 'BATMAN',
    alias: 'Bruce Wayne',
    powers: ['Intelligence', 'Martial arts', 'Technology'],
    universe: 'DC',
    createdAt: new Date('2000-01-02'),
  },
  {
    id: 3,
    name: 'SPIDER-MAN',
    alias: 'Peter Parker',
    powers: ['Web-slinging', 'Spider sense', 'Wall crawling'],
    universe: 'Marvel',
    createdAt: new Date('2000-01-03'),
  },
  {
    id: 4,
    name: 'WONDER WOMAN',
    alias: 'Diana Prince',
    powers: ['Super strength', 'Flight', 'Lasso of Truth'],
    universe: 'DC',
    createdAt: new Date('2000-01-04'),
  },
  {
    id: 5,
    name: 'IRON MAN',
    alias: 'Tony Stark',
    powers: ['Powered armor', 'Genius intellect', 'Flight'],
    universe: 'Marvel',
    createdAt: new Date('2000-01-05'),
  },

  {
    id: 6,
    name: 'AQUAMAN',
    alias: 'Arthur Curry',
    powers: ['Underwater breathing', 'Super strength', 'Telepathy with sea creatures'],
    universe: 'DC',
    createdAt: new Date('2000-01-06'),
  },
];

@Injectable({ providedIn: 'root' })
export class HeroService {
  private readonly _heroes = signal<Hero[]>(INITIAL_HEROES);
  private readonly _searchTerm = signal<string>('');
  private _nextId = INITIAL_HEROES.length + 1;

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


  getById(id: number): Hero | undefined {
    return this._heroes().find((h) => h.id === id);
  }

  search(term: string): void {
    this._searchTerm.set(term);
  }

  // defer() garantiza que el id se genere en el momento de la suscripción, no de la creación
  add(hero: Omit<Hero, 'id' | 'createdAt'>): Observable<Hero> {
    return defer(() => {
      const newHero: Hero = { ...hero, id: this._nextId++, createdAt: new Date() };
      return of(newHero).pipe(
        delay(SIMULATED_DELAY_MS),
        tap(() => this._heroes.update((heroes) => [...heroes, newHero])),
      );
    });
  }

  update(id: number, changes: Partial<Omit<Hero, 'id' | 'createdAt'>>): Observable<Hero | null> {
    return of(null).pipe(
      delay(SIMULATED_DELAY_MS),
      map(() => {
        let updated: Hero | null = null;
        this._heroes.update((heroes) =>
          heroes.map((h) => {
            if (h.id === id) {
              updated = { ...h, ...changes };
              return updated;
            }
            return h;
          }),
        );
        return updated;
      }),
    );
  }

  delete(id: number): Observable<void> {
    return of(void 0).pipe(
      delay(SIMULATED_DELAY_MS),
      tap(() => this._heroes.update((heroes) => heroes.filter((h) => h.id !== id))),
    );
  }
}
