package com.djenna.taskmanager.controller;

import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.djenna.taskmanager.dto.PageResponse;
import com.djenna.taskmanager.dto.TaskResponse;
import com.djenna.taskmanager.entity.TaskPriority;
import com.djenna.taskmanager.entity.TaskStatus;
import com.djenna.taskmanager.exception.GlobalExceptionHandler;
import com.djenna.taskmanager.exception.TaskNotFoundException;
import com.djenna.taskmanager.service.TaskService;

import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
class TaskControllerTest {

    @Mock
    private TaskService service;

    @InjectMocks
    private TaskController controller;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    private TaskResponse sample() {
        return new TaskResponse(1L, "Ma tache", "desc", TaskStatus.TODO,
                TaskPriority.HIGH, LocalDateTime.now());
    }

    @Test
    void list_returns200WithTasks() throws Exception {
        when(service.findAll(null, null, null, 0, 10))
                .thenReturn(new PageResponse<>(List.of(sample()), 0, 10, 1, 1));

        mockMvc.perform(get("/api/tasks"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].title").value("Ma tache"))
                .andExpect(jsonPath("$.content[0].priority").value("HIGH"))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    void get_returns404_whenTaskMissing() throws Exception {
        when(service.findById(99L)).thenThrow(new TaskNotFoundException(99L));

        mockMvc.perform(get("/api/tasks/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    void create_returns201_whenValid() throws Exception {
        when(service.create(org.mockito.ArgumentMatchers.any())).thenReturn(sample());

        String body = """
                {"title":"Ma tache","description":"desc","status":"TODO","priority":"HIGH"}
                """;

        mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    void create_returns400_whenTitleBlank() throws Exception {
        String body = """
                {"title":"","status":"TODO","priority":"LOW"}
                """;

        mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.title").exists());
    }

    @Test
    void delete_returns204() throws Exception {
        mockMvc.perform(delete("/api/tasks/1"))
                .andExpect(status().isNoContent());

        verify(service).delete(1L);
    }

    @Test
    void delete_returns404_whenTaskMissing() throws Exception {
        doThrow(new TaskNotFoundException(99L)).when(service).delete(99L);

        mockMvc.perform(delete("/api/tasks/99"))
                .andExpect(status().isNotFound());
    }
}