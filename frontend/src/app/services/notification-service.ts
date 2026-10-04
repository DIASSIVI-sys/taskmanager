import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Notification } from '../components/notification/notification';

export type NotificationType = 'success' | 'error' | 'info';

export interface NotificationData {
  message: string;
  type: NotificationType;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);

  success(message: string): void {
    this.open(message, 'success', 3000);
  }

  error(message: string): void {
    this.open(message, 'error', 5000);
  }

  info(message: string): void {
    this.open(message, 'info', 3000);
  }

  private open(message: string, type: NotificationType, duration: number): void {
    this.snackBar.openFromComponent(Notification, {
      data: { message, type } satisfies NotificationData,
      duration,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
      panelClass: ['task-notification-panel'],
    });
  }
}
