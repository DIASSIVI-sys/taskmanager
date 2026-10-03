package com.djenna.taskmanager.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.djenna.taskmanager.dto.TaskRequest;
import com.djenna.taskmanager.dto.TaskResponse;
import com.djenna.taskmanager.entity.Task;
import com.djenna.taskmanager.entity.TaskPriority;
import com.djenna.taskmanager.entity.TaskStatus;
import com.djenna.taskmanager.exception.TaskNotFoundException;
import com.djenna.taskmanager.repository.TaskRepository;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.ArgumentMatchers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskRepository repository;

    @InjectMocks
    private TaskService service;

    private Task buildTask(String title) {
        Task task = new Task();
        task.setTitle(title);
        task.setDescription("desc");
        task.setStatus(TaskStatus.TODO);
        task.setPriority(TaskPriority.MEDIUM);
        return task;
    }

    @Test
    void create_savesTaskWithRequestValues() {
        TaskRequest request = new TaskRequest("Nouvelle", "desc", TaskStatus.IN_PROGRESS, TaskPriority.HIGH);
        when(repository.save(any(Task.class))).thenAnswer(inv -> inv.getArgument(0));

        TaskResponse response = service.create(request);

        ArgumentCaptor<Task> captor = ArgumentCaptor.forClass(Task.class);
        verify(repository).save(captor.capture());
        assertThat(captor.getValue().getTitle()).isEqualTo("Nouvelle");
        assertThat(response.status()).isEqualTo(TaskStatus.IN_PROGRESS);
        assertThat(response.priority()).isEqualTo(TaskPriority.HIGH);
    }

    @Test
    void findById_returnsTask_whenExists() {
        when(repository.findById(1L)).thenReturn(Optional.of(buildTask("Ma tache")));

        TaskResponse response = service.findById(1L);

        assertThat(response.title()).isEqualTo("Ma tache");
    }

    @Test
    void findById_throwsNotFound_whenMissing() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.findById(99L))
                .isInstanceOf(TaskNotFoundException.class)
                .hasMessageContaining("99");
    }

    @Test
    void update_changesAllFields() {
        Task existing = buildTask("Ancien titre");
        when(repository.findById(1L)).thenReturn(Optional.of(existing));
        TaskRequest request = new TaskRequest("Nouveau titre", null, TaskStatus.DONE, TaskPriority.LOW);

        TaskResponse response = service.update(1L, request);

        assertThat(response.title()).isEqualTo("Nouveau titre");
        assertThat(response.description()).isNull();
        assertThat(response.status()).isEqualTo(TaskStatus.DONE);
        assertThat(response.priority()).isEqualTo(TaskPriority.LOW);
    }

    @Test
    void updateStatus_changesOnlyStatus() {
        Task existing = buildTask("Tache");
        when(repository.findById(1L)).thenReturn(Optional.of(existing));

        TaskResponse response = service.updateStatus(1L, TaskStatus.DONE);

        assertThat(response.status()).isEqualTo(TaskStatus.DONE);
        assertThat(response.priority()).isEqualTo(TaskPriority.MEDIUM);
    }

    @Test
    void delete_removesTask_whenExists() {
        Task existing = buildTask("A supprimer");
        when(repository.findById(1L)).thenReturn(Optional.of(existing));

        service.delete(1L);

        verify(repository).delete(existing);
    }

    @Test
    void delete_throwsNotFound_andDeletesNothing_whenMissing() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.delete(99L)).isInstanceOf(TaskNotFoundException.class);

        verify(repository, never()).delete(any(Task.class));
    }

    @Test
    void findAll_mapsEntitiesToResponses() {
        when(repository.findAll(ArgumentMatchers.<Specification<Task>>any(), any(Sort.class)))
                .thenReturn(List.of(buildTask("A"), buildTask("B")));

        List<TaskResponse> result = service.findAll("a", TaskStatus.TODO, null);

        assertThat(result).extracting(TaskResponse::title).containsExactly("A", "B");
    }
}