import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Task } from '../../models/task.model';
import { TaskDetail } from './task-detail';

describe('TaskDetail', () => {
  const task: Task = {
    id: 1,
    title: 'Ma tache',
    description: 'desc',
    status: 'TODO',
    priority: 'HIGH',
    createdAt: '2026-10-03T10:00:00',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskDetail],
      providers: [{ provide: MAT_DIALOG_DATA, useValue: task }],
    }).compileComponents();
  });

  it('affiche le titre et les libellés français', async () => {
    const fixture = TestBed.createComponent(TaskDetail);
    await fixture.whenStable();
    const text = (fixture.nativeElement as HTMLElement).textContent;

    expect(text).toContain('Ma tache');
    expect(text).toContain('À faire');
    expect(text).toContain('Haute');
  });
});