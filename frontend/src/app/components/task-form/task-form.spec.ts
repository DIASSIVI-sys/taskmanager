import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TaskForm } from './task-form';

describe('TaskForm', () => {
  const dialogRefMock = { close: vi.fn() };

  beforeEach(async () => {
    dialogRefMock.close.mockClear();
    await TestBed.configureTestingModule({
      imports: [TaskForm],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: MAT_DIALOG_DATA, useValue: null },
      ],
    }).compileComponents();
  });

  it('est invalide quand le titre est vide', () => {
    const fixture = TestBed.createComponent(TaskForm);
    expect(fixture.componentInstance.form.valid).toBe(false);
  });

  it('ne ferme pas le dialogue si le formulaire est invalide', () => {
    const fixture = TestBed.createComponent(TaskForm);
    fixture.componentInstance.save();
    expect(dialogRefMock.close).not.toHaveBeenCalled();
  });

  it('renvoie la requête quand le formulaire est valide', () => {
    const fixture = TestBed.createComponent(TaskForm);
    fixture.componentInstance.form.patchValue({ title: 'Nouvelle', description: '' });
    fixture.componentInstance.save();

    expect(dialogRefMock.close).toHaveBeenCalledWith({
      title: 'Nouvelle',
      description: null,
      status: 'TODO',
      priority: 'MEDIUM',
    });
  });
});