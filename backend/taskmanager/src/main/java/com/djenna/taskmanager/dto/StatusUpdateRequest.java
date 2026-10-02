package com.djenna.taskmanager.dto;

import com.djenna.taskmanager.entity.TaskStatus;
import jakarta.validation.constraints.NotNull;

public record StatusUpdateRequest(@NotNull TaskStatus status) {
}