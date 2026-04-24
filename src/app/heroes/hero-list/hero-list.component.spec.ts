import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Subject, of } from 'rxjs';

import { HeroListComponent } from './hero-list.component';
import { HeroService } from '../../core/services/hero.service';
import { LoadingService } from '../../core/services/loading.service';
import { Hero } from '../../core/models/hero.model';

const MOCK_HEROES: Hero[] = [
  { id: 1, name: 'SUPERMAN', alias: 'Clark Kent', powers: ['Flight'], universe: 'DC', createdAt: new Date() },
  { id: 2, name: 'BATMAN', alias: 'Bruce Wayne', powers: ['Intelligence'], universe: 'DC', createdAt: new Date() },
  { id: 3, name: 'SPIDER-MAN', alias: 'Peter Parker', powers: ['Web-slinging'], universe: 'Marvel', createdAt: new Date() },
];

describe('HeroListComponent', () => {
  let fixture: ComponentFixture<HeroListComponent>;
  let component: HeroListComponent;
  let router: Router;
  let heroServiceSpy: {
    filteredHeroes: ReturnType<typeof signal<Hero[]>>;
    search: jasmine.Spy;
    delete: jasmine.Spy;
  };
  let loadingServiceStub: {
    isLoading: ReturnType<typeof signal<boolean>>;
    withLoading: jasmine.Spy;
  };
  let dialogSpy: jasmine.SpyObj<MatDialog>;

  beforeEach(async () => {
    heroServiceSpy = {
      filteredHeroes: signal<Hero[]>(MOCK_HEROES),
      search: jasmine.createSpy('search'),
      delete: jasmine.createSpy('delete').and.returnValue(of(undefined)),
    };

    loadingServiceStub = {
      isLoading: signal(false),
      withLoading: jasmine.createSpy('withLoading').and.callFake((obs$: any) => obs$),
    };

    dialogSpy = jasmine.createSpyObj<MatDialog>('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      imports: [HeroListComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        provideRouter([]),
        { provide: HeroService, useValue: heroServiceSpy },
        { provide: LoadingService, useValue: loadingServiceStub },
        { provide: MatDialog, useValue: dialogSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeroListComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });


  describe('totalHeroes', () => {
    it('should reflect the count of filtered heroes', () => {
      expect((component as any).totalHeroes()).toBe(MOCK_HEROES.length);
    });
  });


  describe('paginatedHeroes', () => {
    it('should return the correct slice for page 0', () => {
      expect((component as any).paginatedHeroes()).toEqual(MOCK_HEROES);
    });

    it('should return an empty array when the page is out of range', () => {
      component.onPageChange({ pageIndex: 10, pageSize: 5, length: MOCK_HEROES.length } as PageEvent);
      expect((component as any).paginatedHeroes().length).toBe(0);
    });
  });


  describe('onAdd', () => {
    it('should navigate to /heroes/new', () => {
      const navigateSpy = spyOn(router, 'navigate');
      component.onAdd();
      expect(navigateSpy).toHaveBeenCalledWith(['/heroes/new']);
    });
  });


  describe('onEdit', () => {
    it('should navigate to /heroes/edit/:id', () => {
      const navigateSpy = spyOn(router, 'navigate');
      component.onEdit(42);
      expect(navigateSpy).toHaveBeenCalledWith(['/heroes/edit', 42]);
    });
  });


  describe('searchControl', () => {
    it('should delegate to heroService.search with the input value', (done) => {
      (component as any).searchControl.setValue('spider');
      setTimeout(() => {
        expect(heroServiceSpy.search).toHaveBeenCalledWith('spider');
        done();
      }, 350);
    });

    it('should reset pageIndex to 0 after searching', (done) => {
      component.onPageChange({ pageIndex: 2, pageSize: 5, length: 30 } as PageEvent);
      (component as any).searchControl.setValue('batman');
      setTimeout(() => {
        expect((component as any).pageIndex()).toBe(0);
        done();
      }, 350);
    });
  });


  describe('onPageChange', () => {
    it('should update both pageIndex and pageSize signals', () => {
      component.onPageChange({ pageIndex: 1, pageSize: 10, length: 30 } as PageEvent);
      expect((component as any).pageIndex()).toBe(1);
      expect((component as any).pageSize()).toBe(10);
    });
  });


  describe('onDelete', () => {
    let afterClosed$: Subject<boolean | undefined>;

    beforeEach(() => {
      afterClosed$ = new Subject<boolean | undefined>();
      dialogSpy.open.and.returnValue({
        afterClosed: () => afterClosed$.asObservable(),
      } as MatDialogRef<any>);
    });

    it('should open a confirm dialog', () => {
      component.onDelete(1, 'SUPERMAN');
      expect(dialogSpy.open).toHaveBeenCalled();
    });

    it('should pass the hero name in the dialog message', () => {
      component.onDelete(1, 'SUPERMAN');
      const [, config] = dialogSpy.open.calls.mostRecent().args;
      expect((config as any)?.data?.message).toContain('SUPERMAN');
    });

    it('should call heroService.delete when the user confirms', () => {
      component.onDelete(1, 'SUPERMAN');
      afterClosed$.next(true);
      expect(heroServiceSpy.delete).toHaveBeenCalledWith(1);
    });

    it('should NOT call heroService.delete when the user cancels', () => {
      component.onDelete(1, 'SUPERMAN');
      afterClosed$.next(false);
      expect(heroServiceSpy.delete).not.toHaveBeenCalled();
    });

    it('should NOT call heroService.delete when the dialog is dismissed without a value', () => {
      component.onDelete(1, 'SUPERMAN');
      afterClosed$.next(undefined);
      expect(heroServiceSpy.delete).not.toHaveBeenCalled();
    });
  });
});
