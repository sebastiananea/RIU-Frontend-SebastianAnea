import { Injectable, signal } from '@angular/core';
import { Observable, defer, finalize } from 'rxjs';

/**
 * Interceptor a nivel de servicio.
 * La consigna pide mostrar un spinner en operaciones como borrado/edición,
 * pero no hay backend real ni HttpClient. Un HttpInterceptor solo dispara
 * con llamadas HTTP, por lo cual no funcionaria en este caso. Este servicio
 * envuelve cualquier Observable con withLoading()
 */
@Injectable({ providedIn: 'root' })
export class LoadingService {
  readonly isLoading = signal(false);

  withLoading<T>(source$: Observable<T>): Observable<T> {
    return defer(() => {
      this.isLoading.set(true);
      return source$.pipe(finalize(() => this.isLoading.set(false)));
    });
  }
}
