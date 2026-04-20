import { Injectable, computed, signal } from '@angular/core';
import { Hero } from '../models/hero.model';

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


  private readonly SIMULATED_DELAY_MS = 500;

  private delay(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, this.SIMULATED_DELAY_MS));
  }

  getById(id: number): Hero | undefined {
    return this._heroes().find((h) => h.id === id);
  }

  search(term: string): void {
    this._searchTerm.set(term);
  }

  async add(hero: Omit<Hero, 'id' | 'createdAt'>): Promise<Hero> {
    await this.delay();
    const newHero: Hero = {
      ...hero,
      id: this._nextId++,
      createdAt: new Date(),
    };
    this._heroes.update((heroes) => [...heroes, newHero]);
    return newHero;
  }

  async update(id: number, changes: Partial<Omit<Hero, 'id' | 'createdAt'>>): Promise<Hero | null> {
    await this.delay();
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
  }

  async delete(id: number): Promise<void> {
    await this.delay();
    this._heroes.update((heroes) => heroes.filter((h) => h.id !== id));
  }
}
