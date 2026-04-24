import { Component, DestroyRef, inject, computed, signal, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { filter, switchMap, debounceTime, distinctUntilChanged } from 'rxjs';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { HeroService } from '../../core/services/hero.service';
import { LoadingService } from '../../core/services/loading.service';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-hero-list',
  imports: [
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatCardModule,
  ],
  templateUrl: './hero-list.component.html',
  styleUrl: './hero-list.component.scss',
})
export class HeroListComponent implements OnInit {
  private readonly heroService = inject(HeroService);
  private readonly loadingService = inject(LoadingService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly searchControl = new FormControl('');

  protected readonly isLoading = this.loadingService.isLoading;
  protected readonly pageIndex = signal(0);
  protected readonly pageSize = signal(5);
  protected readonly displayedColumns = ['name', 'alias', 'universe', 'powers', 'actions'];

  protected readonly totalHeroes = computed(() => this.heroService.filteredHeroes().length);

  protected readonly paginatedHeroes = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    return this.heroService.filteredHeroes().slice(start, start + this.pageSize());
  });

  ngOnInit(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((searchTerm) => {
        this.heroService.search(searchTerm || '');
        this.pageIndex.set(0);
      });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  onAdd(): void {
    this.router.navigate(['/heroes/new']);
  }

  onEdit(id: number): void {
    this.router.navigate(['/heroes/edit', id]);
  }

  onDelete(id: number, name: string): void {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: 'Eliminar héroe',
          message: `¿Estás seguro que deseas eliminar a ${name}?`,
        },
      })
      .afterClosed()
      .pipe(
        filter((confirmed) => !!confirmed),
        switchMap(() => this.loadingService.withLoading(this.heroService.delete(id))),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }
}

