import { Directive, ElementRef, HostListener, HostBinding, inject } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appUpperCaseInput]',
})
export class UpperCaseInputDirective {
  private readonly control = inject(NgControl, { self: true });
  private readonly el = inject<ElementRef<HTMLInputElement>>(ElementRef);

  @HostBinding('style.text-transform') textTransform = 'uppercase';

  @HostListener('blur')
  onBlur(): void {
    const upper = this.el.nativeElement.value.toUpperCase();
    this.control.control?.setValue(upper);
  }
}
