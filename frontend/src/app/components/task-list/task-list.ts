import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  Task,
  TaskRequest,
  TaskPriority,
  TaskStatus,
} from '../../models/task.model';
import { TaskApi } from '../../services/task-api';
import { TaskForm } from '../task-form/task-form';

@Component({
  selector: 'app-task-list',
  imports: [
    DatePipe,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatSelectModule,
    ReactiveFormsModule,
  ],
  templateUrl: './task-list.html',
  styleUrl: './task-list.css',
})
export class TaskList implements OnInit {
  private readonly taskApi = inject(TaskApi);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly tasks = signal<Task[]>([]);
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly statusLabels = STATUS_LABELS;
  readonly priorityLabels = PRIORITY_LABELS;
  readonly statuses = Object.keys(STATUS_LABELS) as TaskStatus[];

    readonly priorities = Object.keys(PRIORITY_LABELS) as TaskPriority[];

  readonly searchControl = new FormControl('', { nonNullable: true });
  readonly statusFilter = new FormControl<TaskStatus | ''>('', { nonNullable: true });
  readonly priorityFilter = new FormControl<TaskPriority | ''>('', { nonNullable: true });

  constructor() {
    // La recherche attend 300 ms après la dernière frappe avant d'appeler l'API
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe(() => this.loadTasks());

    this.statusFilter.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.loadTasks());
    this.priorityFilter.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.loadTasks());
  }

  resetFilters(): void {
    this.searchControl.setValue('', { emitEvent: false });
    this.statusFilter.setValue('', { emitEvent: false });
    this.priorityFilter.setValue('', { emitEvent: false });
    this.loadTasks();
  }
  ngOnInit(): void {
    this.loadTasks();
  }

   loadTasks(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.taskApi
      .getAll({
        search: this.searchControl.value.trim(),
        status: this.statusFilter.value,
        priority: this.priorityFilter.value,
      })
      .subscribe({
        next: (tasks) => {
          this.tasks.set(tasks);
          this.loading.set(false);
        },
        error: () => {
          this.errorMessage.set('Impossible de charger les tâches. Le serveur est-il démarré ?');
          this.loading.set(false);
        },
      });
  }

  openForm(task?: Task): void {
    this.dialog
      .open<TaskForm, Task | null, TaskRequest>(TaskForm, {
        data: task ?? null,
        width: '500px',
        maxWidth: '95vw',
      })
      .afterClosed()
      .subscribe((request) => {
        if (!request) return; // dialogue annulé

        const call = task
          ? this.taskApi.update(task.id, request)
          : this.taskApi.create(request);

        call.subscribe({
          next: () => {
            this.notify(task ? 'Tâche modifiée' : 'Tâche créée');
            this.loadTasks();
          },
          error: () => this.notify("L'enregistrement a échoué"),
        });
      });
  }

  changeStatus(task: Task, status: TaskStatus): void {
    this.taskApi.updateStatus(task.id, status).subscribe({
      next: (updated) => {
        this.tasks.update((list) => list.map((t) => (t.id === updated.id ? updated : t)));
        this.notify('Statut mis à jour');
      },
      error: () => this.notify('Le changement de statut a échoué'),
    });
  }

  deleteTask(task: Task): void {
    if (!confirm(`Supprimer la tâche « ${task.title} » ?`)) return;

    this.taskApi.delete(task.id).subscribe({
      next: () => {
        this.tasks.update((list) => list.filter((t) => t.id !== task.id));
        this.notify('Tâche supprimée');
      },
      error: () => this.notify('La suppression a échoué'),
    });
  }

  private notify(message: string): void {
    this.snackBar.open(message, 'OK', { duration: 3000 });
  }
}