import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { HeroService } from './hero.service';

describe('HeroService', () => {
    let service: HeroService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [provideZonelessChangeDetection()],
        });
        service = TestBed.inject(HeroService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    // --- heroes ---
    describe('heroes', () => {
        it('should return the initial list of 6 heroes', () => {
            expect(service.heroes().length).toBe(6);
        });
    });

    // --- getById ---
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

    // --- search / filteredHeroes ---
    describe('search / filteredHeroes', () => {
        it('should return all heroes when the search term is empty', () => {
            service.search('');
            expect(service.filteredHeroes().length).toBe(6);
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

    // --- add ---
    describe('add', () => {
        it('should add a new hero and return it after the simulated delay', async () => {
            const heroData = { name: 'THOR', alias: 'Thor Odinson', powers: ['Thunder'], universe: 'Marvel' };

            const addedHero = await firstValueFrom(service.add(heroData));

            expect(addedHero).toBeDefined();
            expect(addedHero.name).toBe('THOR');
            expect(addedHero.id).toBeGreaterThan(0);
            expect(addedHero.createdAt).toBeInstanceOf(Date);
        });

        it('should persist the new hero in the heroes signal', async () => {
            const initial = service.heroes().length;

            await firstValueFrom(service.add({ name: 'THOR', alias: 'Thor Odinson', powers: ['Thunder'], universe: 'Marvel' }));

            expect(service.heroes().length).toBe(initial + 1);
        });

        it('should auto-increment ids across consecutive calls', async () => {
            const heroA = await firstValueFrom(service.add({ name: 'HERO A', alias: 'A', powers: [], universe: 'X' }));
            const heroB = await firstValueFrom(service.add({ name: 'HERO B', alias: 'B', powers: [], universe: 'X' }));

            expect(heroB.id).toBe(heroA.id + 1);
        });
    });

    // --- update ---
    describe('update', () => {
        it('should update the hero and return the updated value', async () => {
            const result = await firstValueFrom(service.update(1, { name: 'SUPERWOMAN' }));

            expect(result).toBeDefined();
            expect(result!.name).toBe('SUPERWOMAN');
        });

        it('should persist the updated hero in the heroes signal', async () => {
            await firstValueFrom(service.update(1, { universe: 'Marvel' }));

            expect(service.getById(1)!.universe).toBe('Marvel');
        });

        it('should not mutate other heroes', async () => {
            await firstValueFrom(service.update(1, { name: 'SUPERWOMAN' }));

            expect(service.getById(2)!.name).toBe('BATMAN');
        });

        it('should return null when the hero id does not exist', async () => {
            const result = await firstValueFrom(service.update(9999, { name: 'NOBODY' }));

            expect(result).toBeNull();
        });
    });

    // --- delete ---
    describe('delete', () => {
        it('should remove the hero from the heroes signal', async () => {
            const initial = service.heroes().length;

            await firstValueFrom(service.delete(1));

            expect(service.heroes().length).toBe(initial - 1);
            expect(service.getById(1)).toBeUndefined();
        });

        it('should not affect other heroes when deleting', async () => {
            await firstValueFrom(service.delete(1));

            expect(service.getById(2)).toBeDefined();
        });
    });
});
