import { Injectable, signal } from '@angular/core';
import { Observable, defer, finalize } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  readonly isLoading = signal(false);

  show(): void {
    this.isLoading.set(true);
  }

  hide(): void {
    this.isLoading.set(false);
  }

  withLoading<T>(source$: Observable<T>): Observable<T> {
    return defer(() => {
      this.show();
      return source$.pipe(finalize(() => this.hide()));
    });
  }
}
