import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  Task,
  TaskPriority,
  TaskRequest,
  TaskStatus,
} from '../../models/task.model';

@Component({
  selector: 'app-task-form',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  templateUrl: './task-form.html',
  styleUrl: './task-form.css',
})
export class TaskForm {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<TaskForm, TaskRequest>);
  readonly task: Task | null = inject<Task | null>(MAT_DIALOG_DATA, { optional: true }) ?? null;

  readonly statuses = Object.keys(STATUS_LABELS) as TaskStatus[];
  readonly priorities = Object.keys(PRIORITY_LABELS) as TaskPriority[];
  readonly statusLabels = STATUS_LABELS;
  readonly priorityLabels = PRIORITY_LABELS;

  readonly form = this.fb.nonNullable.group({
    title: [this.task?.title ?? '', [Validators.required, Validators.maxLength(150)]],
    description: [this.task?.description ?? '', [Validators.maxLength(1000)]],
    status: [this.task?.status ?? ('TODO' as TaskStatus), Validators.required],
    priority: [this.task?.priority ?? ('MEDIUM' as TaskPriority), Validators.required],
  });

  get isEdit(): boolean {
    return this.task !== null;
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const request: TaskRequest = {
      ...value,
      description: value.description.trim() === '' ? null : value.description,
    };
    this.dialogRef.close(request);
  }
}