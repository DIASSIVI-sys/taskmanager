import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_SNACK_BAR_DATA, MatSnackBarModule, MatSnackBarRef } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { NotificationData } from '../../services/notification-service';

@Component({
  selector: 'app-notification',
  imports: [MatButtonModule, MatIconModule, MatSnackBarModule],
  templateUrl: './notification.html',
  styleUrl: './notification.css',
})
export class Notification {
  readonly data = inject<NotificationData>(MAT_SNACK_BAR_DATA);
  private readonly snackBarRef = inject<MatSnackBarRef<Notification>>(MatSnackBarRef);

  get icon(): string {
    switch (this.data.type) {
      case 'success':
        return 'check_circle';
      case 'error':
        return 'error';
      case 'info':
        return 'info';
    }
  }

  close(): void {
    this.snackBarRef.dismiss();
  }
}
