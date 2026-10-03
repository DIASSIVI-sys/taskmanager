import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PageResponse, Task, TaskPriority, TaskRequest, TaskStatus } from '../models/task.model';

export interface TaskFilters {
  search?: string;
  status?: TaskStatus | '';
  priority?: TaskPriority | '';
  page?: number;
  size?: number;
}

@Injectable({ providedIn: 'root' })
export class TaskApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api/tasks';

  getAll(filters: TaskFilters = {}): Observable<PageResponse<Task>> {
    let params = new HttpParams();
    params = params.set('page', filters.page ?? 0).set('size', filters.size ?? 10);
    if (filters.search) params = params.set('search', filters.search);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.priority) params = params.set('priority', filters.priority);
    return this.http.get<PageResponse<Task>>(this.baseUrl, { params });
  }

  getById(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.baseUrl}/${id}`);
  }

  create(task: TaskRequest): Observable<Task> {
    return this.http.post<Task>(this.baseUrl, task);
  }

  update(id: number, task: TaskRequest): Observable<Task> {
    return this.http.put<Task>(`${this.baseUrl}/${id}`, task);
  }

  updateStatus(id: number, status: TaskStatus): Observable<Task> {
    return this.http.patch<Task>(`${this.baseUrl}/${id}/status`, { status });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}