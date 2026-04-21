import { Component, DestroyRef, computed, effect, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { map, startWith } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HeroService } from '../../core/services/hero.service';
import { LoadingService } from '../../core/services/loading.service';
import { UpperCaseInputDirective } from '../../core/directives/upperCaseInputDirective';

@Component({
  selector: 'app-hero-form',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    UpperCaseInputDirective,
  ],
  templateUrl: './hero-form.component.html',
  styleUrl: './hero-form.component.scss',
})
export class HeroFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly heroService = inject(HeroService);
  private readonly loadingService = inject(LoadingService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  // withComponentInputBinding() permite recibir el parámetro de ruta `:id` como signal
  readonly id = input<number | null, string | undefined>(null, {
    transform: (value: string | undefined) => (value ? Number(value) : null),
  });

  protected readonly isLoading = this.loadingService.isLoading;

  protected readonly isEditMode = computed(() => this.id() !== null);

  protected readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    alias: ['', Validators.required],
    // Los poderes se ingresan separados por coma y se transforman a array al guardar
    powers: ['', Validators.required],
    universe: ['', Validators.required],
  });

  // Bridgeamos el estado del formulario (Observable) a una signal para usarla en el template
  protected readonly isFormValid = toSignal(
    this.form.statusChanges.pipe(
      map((status) => status === 'VALID'),
      startWith(this.form.valid),
    ),
  );

  constructor() {
    // effect() reacciona cuando heroId cambia (ej: navegación directa a /heroes/edit/:id)
    // y precarga los datos del héroe en el formulario
    effect(() => {
      const id = this.id();
      if (id === null) return;

      const hero = this.heroService.getById(id);
      if (hero) {
        this.form.patchValue({
          name: hero.name,
          alias: hero.alias,
          powers: hero.powers.join(', '),
          universe: hero.universe,
        });
      }
    });
  }

  onSave(): void {
    if (this.form.invalid) return;

    const { name, alias, powers, universe } = this.form.getRawValue();
    const heroData = {
      name: name!,
      alias: alias!,
      powers: powers!
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean),
      universe: universe!,
    };

    const id = this.id();
    const operation$ = id !== null
      ? this.heroService.update(id, heroData)
      : this.heroService.add(heroData);

    this.loadingService
      .withLoading(operation$)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.router.navigate(['/heroes']));
  }

  onCancel(): void {
    this.router.navigate(['/heroes']);
  }
}
