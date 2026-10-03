package com.djenna.taskmanager.service;

import com.djenna.taskmanager.dto.TaskRequest;
import com.djenna.taskmanager.dto.PageResponse;
import com.djenna.taskmanager.dto.TaskResponse;
import com.djenna.taskmanager.entity.Task;
import com.djenna.taskmanager.entity.TaskPriority;
import com.djenna.taskmanager.entity.TaskStatus;
import com.djenna.taskmanager.exception.TaskNotFoundException;
import com.djenna.taskmanager.repository.TaskRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class TaskService {

    private final TaskRepository repository;

    public TaskService(TaskRepository repository) {
        this.repository = repository;
    }

    public PageResponse<TaskResponse> findAll(
            String search, TaskStatus status, TaskPriority priority, int page, int size) {
        Specification<Task> spec = (root, query, cb) -> cb.conjunction();

        if (search != null && !search.isBlank()) {
            spec = spec.and((root, query, cb) ->
                    cb.like(cb.lower(root.get("title")), "%" + search.toLowerCase() + "%"));
        }
        if (status != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), status));
        }
        if (priority != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("priority"), priority));
        }

        int boundedPage = Math.max(0, page);
        int boundedSize = Math.clamp(size, 1, 100);
        Sort sort = Sort.by(
                Sort.Order.desc("createdAt"),
                Sort.Order.desc("id"));
        Page<Task> result = repository.findAll(spec, PageRequest.of(boundedPage, boundedSize, sort));
        return PageResponse.from(result.map(TaskResponse::from));
    }

    public TaskResponse findById(Long id) {
        return TaskResponse.from(getOrThrow(id));
    }

    @Transactional
    public TaskResponse create(TaskRequest request) {
        Task task = new Task();
        apply(task, request);
        return TaskResponse.from(repository.save(task));
    }

    @Transactional
    public TaskResponse update(Long id, TaskRequest request) {
        Task task = getOrThrow(id);
        apply(task, request);
        return TaskResponse.from(task);
    }

    @Transactional
    public TaskResponse updateStatus(Long id, TaskStatus status) {
        Task task = getOrThrow(id);
        task.setStatus(status);
        return TaskResponse.from(task);
    }

    @Transactional
    public void delete(Long id) {
        repository.delete(getOrThrow(id));
    }

    private Task getOrThrow(Long id) {
        return repository.findById(id).orElseThrow(() -> new TaskNotFoundException(id));
    }

    private void apply(Task task, TaskRequest request) {
        task.setTitle(request.title());
        task.setDescription(request.description());
        task.setStatus(request.status());
        task.setPriority(request.priority());
    }
}