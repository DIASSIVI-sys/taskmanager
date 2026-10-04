import { TestBed } from '@angular/core/testing';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
import { Notification } from './notification';

describe('Notification', () => {
  const snackBarRef = { dismiss: vi.fn() };

  beforeEach(() => {
    snackBarRef.dismiss.mockClear();
  });

  for (const [type, icon] of [
    ['success', 'check_circle'],
    ['error', 'error'],
    ['info', 'info'],
  ] as const) {
    it(`affiche le message et l’icône ${icon} pour ${type}`, async () => {
      await TestBed.configureTestingModule({
        imports: [Notification],
        providers: [
          { provide: MAT_SNACK_BAR_DATA, useValue: { message: 'Opération terminée', type } },
          { provide: MatSnackBarRef, useValue: snackBarRef },
        ],
      }).compileComponents();

      const fixture = TestBed.createComponent(Notification);
      fixture.detectChanges();
      const element = fixture.nativeElement as HTMLElement;

      expect(element.textContent).toContain('Opération terminée');
      expect(element.querySelector('.notification-icon')?.textContent?.trim()).toBe(icon);

      fixture.destroy();
      TestBed.resetTestingModule();
    });
  }

  it('ferme la notification au clic sur le bouton Fermer', async () => {
    await TestBed.configureTestingModule({
      imports: [Notification],
      providers: [
        { provide: MAT_SNACK_BAR_DATA, useValue: { message: 'Information', type: 'info' } },
        { provide: MatSnackBarRef, useValue: snackBarRef },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(Notification);
    fixture.detectChanges();
    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>('button[aria-label="Fermer"]')
      ?.click();

    expect(snackBarRef.dismiss).toHaveBeenCalled();
  });
});
