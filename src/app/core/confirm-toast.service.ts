import { Injectable, inject } from '@angular/core';
import { ActiveToast, IndividualConfig, ToastrService } from 'ngx-toastr';
import { merge, Observable, of } from 'rxjs';
import { finalize, map, take, tap } from 'rxjs/operators';
import { ConfirmToastComponent, ConfirmToastContext } from '../shared/confirm-toast/confirm-toast.component';
import { SoundService } from './sound.service';

@Injectable({
  providedIn: 'root',
})
export class ConfirmToastService {
  private readonly toastr = inject(ToastrService);
  private readonly soundService = inject(SoundService);
  private active?: ActiveToast<ConfirmToastComponent>;

  confirm(context: ConfirmToastContext): Observable<boolean> {
    this.active?.toastRef.close();

    const overrides: Partial<IndividualConfig> = {
      toastComponent: ConfirmToastComponent,
      positionClass: 'toast-top-center',
      toastClass: 'confirm-toast toast ngx-toastr',
      disableTimeOut: true,
      tapToDismiss: false,
      closeButton: false,
      progressBar: false,
      easing: 'ease-out',
      easeTime: 250,
      newestOnTop: true,
      enableHtml: false,
      extendedTimeOut: 0,
      titleClass: '',
      messageClass: '',
    };

    const activeToast = this.toastr.show('', '', overrides) as
      | ActiveToast<ConfirmToastComponent>
      | undefined;

    if (!activeToast) {
      return of(false);
    }

    this.active = activeToast;
    const instance = activeToast.toastRef.componentInstance as ConfirmToastComponent | null;
    instance?.setContext(context);

    // Play confirmation sound when modal appears
    this.soundService.playWarningSound();

    const confirmed$ = activeToast.onAction.pipe(
      map(() => true),
      tap(() => {
        // Play delete confirmation sound
        this.soundService.playConfirmationSound();
        // Close modal with slight delay to allow sound to play
        setTimeout(() => {
          activeToast.toastRef.close();
        }, 150);
      }),
      take(1)
    );

    const dismissed$ = activeToast.onHidden.pipe(
      map(() => false),
      take(1)
    );

    return merge(confirmed$, dismissed$).pipe(
      take(1),
      finalize(() => {
        if (this.active === activeToast) {
          this.active = undefined;
        }
      })
    );
  }

  confirmDeletion(taskTitle: string): Observable<boolean> {
    return this.confirm({
      title: 'Delete task?',
      message: `Are you sure you want to remove "${taskTitle}"?`,
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      tone: 'danger',
    });
  }
}
