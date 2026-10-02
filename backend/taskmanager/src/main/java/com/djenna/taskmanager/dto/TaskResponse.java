package com.djenna.taskmanager.dto;

import com.djenna.taskmanager.entity.Task;
import com.djenna.taskmanager.entity.TaskPriority;
import com.djenna.taskmanager.entity.TaskStatus;

import java.time.LocalDateTime;

public record TaskResponse(
        Long id,
        String title,
        String description,
        TaskStatus status,
        TaskPriority priority,
        LocalDateTime createdAt
) {
    public static TaskResponse from(Task task) {
        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getStatus(),
                task.getPriority(),
                task.getCreatedAt()
        );
    }
}