import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, HostBinding, inject } from '@angular/core';
import { ToastPackage } from 'ngx-toastr';

export type ConfirmToastTone = 'default' | 'danger';

export interface ConfirmToastContext {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ConfirmToastTone;
}

@Component({
  selector: 'app-confirm-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-toast.component.html',
  styleUrl: './confirm-toast.component.scss',
  animations: [
    trigger('slide', [
      transition(':enter', [
        style({ 
          opacity: 0, 
          transform: 'translateY(-40px) scale(0.95)' 
        }),
        animate(
          '250ms cubic-bezier(0.16, 1, 0.3, 1)',
          style({ 
            opacity: 1, 
            transform: 'translateY(0) scale(1)' 
          })
        ),
      ]),
      transition(':leave', [
        animate(
          '300ms cubic-bezier(0.33, 1, 0.68, 1)',
          style({ 
            opacity: 0, 
            transform: 'translateY(-30px) scale(0.9)' 
          })
        ),
      ]),
    ]),
  ],
})
export class ConfirmToastComponent {
  private readonly toastPackage = inject(ToastPackage);

  private contextValue: ConfirmToastContext = {
    title: 'Delete item?',
    message: 'Are you sure you want to continue?',
    tone: 'default',
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
  } satisfies ConfirmToastContext;

  @HostBinding('class') hostClass = 'pointer-events-auto relative block w-full max-w-sm mx-auto';
  @HostBinding('@slide') readonly animationState = true;
  @HostBinding('style.z-index') zIndex = '9999';

  get context(): ConfirmToastContext {
    return this.contextValue;
  }

  setContext(context: ConfirmToastContext): void {
    this.contextValue = {
      ...this.contextValue,
      ...context,
    } satisfies ConfirmToastContext;
  }

  confirm(): void {
    this.toastPackage.triggerAction();
  }

  dismiss(): void {
    this.toastPackage.toastRef.close();
  }

  get confirmClasses(): string {
    return this.context.tone === 'danger'
      ? 'inline-flex items-center justify-center rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40'
      : 'inline-flex items-center justify-center rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40';
  }

  get iconWrapperClasses(): string {
    return this.context.tone === 'danger'
      ? 'flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10 text-red-500'
      : 'flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary';
  }

  get confirmLabel(): string {
    return this.context.confirmLabel ?? 'Confirm';
  }

  get cancelLabel(): string {
    return this.context.cancelLabel ?? 'Cancel';
  }
}
