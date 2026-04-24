import { HttpEvent, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { Observable, delay } from 'rxjs';
import { Hero } from '../models/hero.model';

const SIMULATED_DELAY_MS = 500;


let BE_HEROES: Hero[] = [
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

let nextId = BE_HEROES.length + 1;

export const mockBackendInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith('/api/heroes')) {
    return next(req);
  }

  return new Observable<HttpEvent<unknown>>(observer => {
    const idMatch = req.url.match(/\/api\/heroes\/(\d+)$/);
    const id = idMatch ? Number(idMatch[1]) : null;
    let body: any = null;

    if (req.method === 'GET') {
      body = [...BE_HEROES];
    } else if (req.method === 'POST') {
      const newHero = { ...(req.body as any), id: nextId++, createdAt: new Date() };
      BE_HEROES.push(newHero);
      body = newHero;
    } else if (req.method === 'PATCH' && id !== null) {
      const index = BE_HEROES.findIndex(h => h.id === id);
      BE_HEROES[index] = { ...BE_HEROES[index], ...(req.body as any) };
      body = BE_HEROES[index];
    } else if (req.method === 'DELETE' && id !== null) {
      BE_HEROES = BE_HEROES.filter(h => h.id !== id);
    }

    observer.next(new HttpResponse({ status: 200, body }));
    observer.complete();
  }).pipe(delay(SIMULATED_DELAY_MS));
};
