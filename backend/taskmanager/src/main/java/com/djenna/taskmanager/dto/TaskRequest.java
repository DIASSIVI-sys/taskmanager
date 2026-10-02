package com.djenna.taskmanager.dto;

import com.djenna.taskmanager.entity.TaskPriority;
import com.djenna.taskmanager.entity.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record TaskRequest(
        @NotBlank @Size(max = 150) String title,
        @Size(max = 1000) String description,
        @NotNull TaskStatus status,
        @NotNull TaskPriority priority
) {
}