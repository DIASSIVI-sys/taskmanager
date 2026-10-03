import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Task, TaskRequest } from '../models/task.model';
import { TaskApi } from './task-api';

describe('TaskApi', () => {
  let service: TaskApi;
  let httpMock: HttpTestingController;
  const baseUrl = 'http://localhost:8080/api/tasks';

  const sampleTask: Task = {
    id: 1,
    title: 'Ma tache',
    description: 'desc',
    status: 'TODO',
    priority: 'HIGH',
    createdAt: '2026-10-03T10:00:00',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TaskApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('getAll envoie les filtres en paramètres de requête', () => {
    const response = {
      content: [sampleTask],
      page: 1,
      size: 5,
      totalElements: 21,
      totalPages: 5,
    };

    service.getAll({ search: 'abc', status: 'TODO', priority: 'HIGH', page: 1, size: 5 }).subscribe((result) => {
      expect(result).toEqual(response);
    });

    const req = httpMock.expectOne((r) => r.url === baseUrl);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('search')).toBe('abc');
    expect(req.request.params.get('status')).toBe('TODO');
    expect(req.request.params.get('priority')).toBe('HIGH');
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('size')).toBe('5');
    req.flush(response);
  });

  it('getAll n envoie pas les filtres vides', () => {
    service.getAll({ search: '', status: '', priority: '' }).subscribe();

    const req = httpMock.expectOne((r) => r.url === baseUrl);
    expect(req.request.params.has('search')).toBe(false);
    expect(req.request.params.has('status')).toBe(false);
    expect(req.request.params.has('priority')).toBe(false);
    expect(req.request.params.get('page')).toBe('0');
    expect(req.request.params.get('size')).toBe('10');
    req.flush({ content: [], page: 0, size: 10, totalElements: 0, totalPages: 0 });
  });

  it('create envoie un POST avec le corps de la tâche', () => {
    const request: TaskRequest = {
      title: 'Nouvelle',
      description: null,
      status: 'TODO',
      priority: 'LOW',
    };

    service.create(request).subscribe((task) => expect(task.id).toBe(1));

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush(sampleTask);
  });

  it('updateStatus envoie un PATCH sur /status', () => {
    service.updateStatus(1, 'DONE').subscribe();

    const req = httpMock.expectOne(`${baseUrl}/1/status`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ status: 'DONE' });
    req.flush({ ...sampleTask, status: 'DONE' });
  });

  it('delete envoie un DELETE', () => {
    service.delete(1).subscribe();

    const req = httpMock.expectOne(`${baseUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});