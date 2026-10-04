import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ConfirmDialog } from './confirm-dialog';

describe('ConfirmDialog', () => {
  let fixture: ComponentFixture<ConfirmDialog>;
  const dialogRef = { close: vi.fn() };

  beforeEach(async () => {
    dialogRef.close.mockClear();
    await TestBed.configureTestingModule({
      imports: [ConfirmDialog],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            title: 'Supprimer cette tâche ?',
            message: 'Supprimer la tâche « Exemple » ?',
          },
        },
        { provide: MatDialogRef, useValue: dialogRef },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmDialog);
    fixture.detectChanges();
  });

  it('affiche le titre, le message et la précision de confirmation', () => {
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Supprimer cette tâche ?');
    expect(element.textContent).toContain('Supprimer la tâche « Exemple » ?');
    expect(element.textContent).toContain('Cette action est irréversible.');
  });

  it('ferme avec false quand Annuler est sélectionné', () => {
    const cancelButton = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('button'),
    ).find((button) => button.textContent?.trim() === 'Annuler');

    cancelButton?.click();

    expect(dialogRef.close).toHaveBeenCalledWith(false);
  });

  it('ferme avec true quand Supprimer est sélectionné', () => {
    const confirmButton = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('button'),
    ).find((button) => button.textContent?.trim() === 'Supprimer');

    confirmButton?.click();

    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });
});
