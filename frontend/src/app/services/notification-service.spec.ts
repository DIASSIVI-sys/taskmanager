import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationService } from './notification-service';

describe('NotificationService', () => {
  const snackBar = { openFromComponent: vi.fn() };
  let service: NotificationService;

  beforeEach(() => {
    snackBar.openFromComponent.mockClear();
    TestBed.configureTestingModule({
      providers: [
        NotificationService,
        { provide: MatSnackBar, useValue: snackBar },
      ],
    });
    service = TestBed.inject(NotificationService);
  });

  it('ouvre un succès avec une durée de 3000 ms', () => {
    service.success('Tâche créée');

    expect(snackBar.openFromComponent).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        data: { message: 'Tâche créée', type: 'success' },
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'bottom',
        panelClass: ['task-notification-panel'],
      }),
    );
  });

  it('ouvre une erreur avec une durée de 5000 ms', () => {
    service.error('Échec');

    expect(snackBar.openFromComponent).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        data: { message: 'Échec', type: 'error' },
        duration: 5000,
      }),
    );
  });

  it('ouvre une information avec une durée de 3000 ms', () => {
    service.info('Information');

    expect(snackBar.openFromComponent).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        data: { message: 'Information', type: 'info' },
        duration: 3000,
      }),
    );
  });
});
