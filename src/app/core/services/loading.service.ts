import { Injectable, signal } from '@angular/core';

/**
 * Interceptor a nivel de servicio.
 * La consigna pide mostrar un spinner en operaciones como borrado/edición,
 * pero no hay backend real ni HttpClient. Un HttpInterceptor solo dispara
 * con llamadas HTTP, por lo cual no funcionaria en este caso. Este servicio envuelve
 * cualquier Promise con withLoading(), cumpliendo el mismo propósito de
 * forma transparente para los componentes y usando signals modernas.
 */
@Injectable({ providedIn: 'root' })
export class LoadingService {
  readonly isLoading = signal(false);

  //Usado para envolver cualquier operación asíncrona que deba mostrar el spinner
  async withLoading<T>(fn: () => Promise<T>): Promise<T> {
    this.isLoading.set(true);
    try {
      return await fn();
    } finally {
      this.isLoading.set(false);
    }
  }
}
