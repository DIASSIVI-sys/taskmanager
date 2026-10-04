import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TaskDetail } from '../task-detail/task-detail';
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  Task,
  TaskRequest,
  TaskPriority,
  TaskStatus,
} from '../../models/task.model';
import { TaskApi } from '../../services/task-api';
import { NotificationService } from '../../services/notification-service';
import { TaskForm } from '../task-form/task-form';
import { ConfirmDialog, ConfirmDialogData } from '../confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-task-list',
  imports: [
    DatePipe,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatMenuModule,
    MatInputModule,
    MatProgressBarModule,
    MatPaginatorModule,
    MatSelectModule,
    MatTooltipModule,
    ReactiveFormsModule,
  ],
  templateUrl: './task-list.html',
  styleUrl: './task-list.css',
})
export class TaskList implements OnInit {
  private readonly taskApi = inject(TaskApi);
  private readonly dialog = inject(MatDialog);
  private readonly notifications = inject(NotificationService);

  readonly tasks = signal<Task[]>([]);
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly totalElements = signal(0);
  readonly pageIndex = signal(0);
  readonly pageSize = signal(10);

  readonly statusLabels = STATUS_LABELS;
  readonly priorityLabels = PRIORITY_LABELS;
  readonly statuses = Object.keys(STATUS_LABELS) as TaskStatus[];

    readonly priorities = Object.keys(PRIORITY_LABELS) as TaskPriority[];

  readonly searchControl = new FormControl('', { nonNullable: true });
  readonly statusFilter = new FormControl<TaskStatus | ''>('', { nonNullable: true });
  readonly priorityFilter = new FormControl<TaskPriority | ''>('', { nonNullable: true });

  get hasActiveFilters(): boolean {
    return Boolean(
      this.searchControl.value.trim() || this.statusFilter.value || this.priorityFilter.value,
    );
  }

  constructor() {
    // La recherche attend 300 ms après la dernière frappe avant d'appeler l'API
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe(() => this.applyFilters());

    this.statusFilter.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.applyFilters());
    this.priorityFilter.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.applyFilters());
  }

  applyFilters(): void {
    this.pageIndex.set(0);
    this.loadTasks();
  }

  resetFilters(): void {
    this.searchControl.setValue('', { emitEvent: false });
    this.statusFilter.setValue('', { emitEvent: false });
    this.priorityFilter.setValue('', { emitEvent: false });
    this.applyFilters();
  }

  ngOnInit(): void {
    this.loadTasks();
  }

  onPage(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadTasks();
  }

  statusIcon(status: TaskStatus): string {
    switch (status) {
      case 'TODO':
        return 'schedule';
      case 'IN_PROGRESS':
        return 'pending';
      case 'DONE':
        return 'check_circle';
    }
    return 'schedule';
  }

  loadTasks(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.taskApi
      .getAll({
        search: this.searchControl.value.trim(),
        status: this.statusFilter.value,
        priority: this.priorityFilter.value,
        page: this.pageIndex(),
        size: this.pageSize(),
      })
      .subscribe({
        next: (result) => {
          this.tasks.set(result.content);
          this.totalElements.set(result.totalElements);
          this.loading.set(false);
        },
        error: () => {
          const message = 'Impossible de charger les tâches. Le serveur est-il démarré ?';
          this.errorMessage.set(message);
          this.notifications.error(message);
          this.loading.set(false);
        },
      });
  }
  openDetail(task: Task): void {
      this.dialog.open(TaskDetail, { data: task, width: '500px', maxWidth: '95vw' });
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
            this.notifications.success(task ? 'Tâche modifiée' : 'Tâche créée');
            if (!task) this.pageIndex.set(0);
            this.loadTasks();
          },
          error: () => this.notifications.error("L'enregistrement a échoué"),
        });
      });
  }

  changeStatus(task: Task, status: TaskStatus): void {
    this.taskApi.updateStatus(task.id, status).subscribe({
      next: (updated) => {
        this.tasks.update((list) => list.map((t) => (t.id === updated.id ? updated : t)));
        this.notifications.success('Statut mis à jour');
      },
      error: () => this.notifications.error('Le changement de statut a échoué'),
    });
  }

  deleteTask(task: Task): void {
    this.dialog
      .open<ConfirmDialog, ConfirmDialogData, boolean>(ConfirmDialog, {
        data: {
          title: 'Supprimer cette tâche ?',
          message: `Supprimer la tâche « ${task.title} » ?`,
        },
        width: '400px',
        maxWidth: '95vw',
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed !== true) return;

        this.taskApi.delete(task.id).subscribe({
          next: () => {
            this.tasks.update((list) => list.filter((t) => t.id !== task.id));
            if (this.tasks().length === 0 && this.pageIndex() > 0) {
              this.pageIndex.update((page) => page - 1);
            }
            this.notifications.success('Tâche supprimée');
            this.loadTasks();
          },
          error: () => this.notifications.error('La suppression a échoué'),
        });
      });
  }
}