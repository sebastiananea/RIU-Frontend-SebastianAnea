import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { HeroService } from './hero.service';
import { Hero } from '../models/hero.model';

const MOCK_HEROES: Hero[] = [
  { id: 1, name: 'SUPERMAN', alias: 'Clark Kent', powers: ['Flight'], universe: 'DC', createdAt: new Date() },
  { id: 2, name: 'BATMAN', alias: 'Bruce Wayne', powers: ['Intelligence'], universe: 'DC', createdAt: new Date() },
  { id: 3, name: 'SPIDER-MAN', alias: 'Peter Parker', powers: ['Web-slinging'], universe: 'Marvel', createdAt: new Date() },
];

describe('HeroService', () => {
  let service: HeroService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting()
      ],
    });
    service = TestBed.inject(HeroService);
    httpTestingController = TestBed.inject(HttpTestingController);


    const req = httpTestingController.expectOne('/api/heroes');
    req.flush(MOCK_HEROES);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });


  describe('heroes', () => {
    it('should return the initial list of heroes', () => {
      expect(service.heroes().length).toBe(3);
    });
  });


  describe('getById', () => {
    it('should return the hero matching the given id', () => {
      const hero = service.getById(1);
      expect(hero).toBeDefined();
      expect(hero!.name).toBe('SUPERMAN');
    });

    it('should return undefined when the id does not exist', () => {
      expect(service.getById(9999)).toBeUndefined();
    });
  });


  describe('search / filteredHeroes', () => {
    it('should return all heroes when the search term is empty', () => {
      service.search('');
      expect(service.filteredHeroes().length).toBe(3);
    });

    it('should filter heroes by name (case-insensitive)', () => {
      service.search('spider');
      const results = service.filteredHeroes();
      expect(results.length).toBe(1);
      expect(results[0].name).toBe('SPIDER-MAN');
    });

    it('should filter heroes by alias', () => {
      service.search('clark');
      const results = service.filteredHeroes();
      expect(results.length).toBe(1);
      expect(results[0].name).toBe('SUPERMAN');
    });

    it('should filter heroes by universe', () => {
      service.search('marvel');
      const results = service.filteredHeroes();
      expect(results.length).toBeGreaterThan(0);
      expect(results.every((h) => h.universe === 'Marvel')).toBeTrue();
    });

    it('should return an empty list when no heroes match', () => {
      service.search('xyz-no-match-9999');
      expect(service.filteredHeroes().length).toBe(0);
    });

    it('should update the searchTerm signal', () => {
      service.search('iron');
      expect(service.searchTerm()).toBe('iron');
    });
  });


  describe('add', () => {
    it('should add a new hero and return it', async () => {
      const heroData = { name: 'THOR', alias: 'Thor Odinson', powers: ['Thunder'], universe: 'Marvel' };
      const mockResponse: Hero = { ...heroData, id: 4, createdAt: new Date() };

      const promise = firstValueFrom(service.add(heroData));
      const req = httpTestingController.expectOne('/api/heroes');
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);

      const addedHero = await promise;
      expect(addedHero).toBeDefined();
      expect(addedHero.name).toBe('THOR');
      expect(addedHero.id).toBe(4);
    });
  });


  describe('update', () => {
    it('should update the hero and return the updated value', async () => {
      const up: Hero = { ...MOCK_HEROES[0], name: 'SUPERWOMAN' };
      const promise = firstValueFrom(service.update(1, { name: 'SUPERWOMAN' }));
      const req = httpTestingController.expectOne('/api/heroes/1');
      expect(req.request.method).toBe('PATCH');
      req.flush(up);

      const result = await promise;
      expect(result).toBeDefined();
      expect(result!.name).toBe('SUPERWOMAN');
    });
  });


  describe('delete', () => {
    it('should remove the hero from the heroes signal', async () => {
      const initial = service.heroes().length;

      const promise = firstValueFrom(service.delete(1));
      const req = httpTestingController.expectOne('/api/heroes/1');
      expect(req.request.method).toBe('DELETE');
      req.flush({});

      await promise;
      expect(service.heroes().length).toBe(initial - 1);
      expect(service.getById(1)).toBeUndefined();
    });
  });
})
