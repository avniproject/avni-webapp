package org.avni.server.service;

import org.avni.server.dao.ConceptRepository;
import org.avni.server.dao.IndividualRepository;
import org.avni.server.dao.UserRepository;
import org.avni.server.dao.task.TaskRepository;
import org.avni.server.dao.task.TaskSearchCriteria;
import org.avni.server.dao.task.TaskStatusRepository;
import org.avni.server.dao.task.TaskTypeRepository;
import org.avni.server.domain.User;
import org.avni.server.domain.task.Task;
import org.avni.server.web.request.task.TaskAssignmentRequest;
import org.avni.server.web.request.task.TaskFilterCriteria;
import org.junit.Test;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class TaskServiceTest {

    @Test
    public void shouldAssignTasksToUsers() {
        TaskAssignmentRequest taskAssignmentRequest = new TaskAssignmentRequest();
        taskAssignmentRequest.setAllSelected(true);
        taskAssignmentRequest.setAssignToUserIds(Arrays.asList(4L, 5L));
        TaskFilterCriteria taskFilterCriteria = new TaskFilterCriteria();
        taskAssignmentRequest.setTaskFilterCriteria(taskFilterCriteria);
        TaskRepository taskRepository = mock(TaskRepository.class);
        UserRepository userRepository = mock(UserRepository.class);
        TaskService taskService = new TaskService(taskRepository, mock(ObservationService.class), mock(TaskTypeRepository.class), mock(TaskStatusRepository.class), mock(IndividualRepository.class), userRepository,
                mock(ConceptRepository.class), mock(ConceptService.class), mock(TaskUnAssigmentService.class));
        List<User> users = Arrays.asList(new User(), new User());
        when(userRepository.findByIdIn(taskAssignmentRequest.getAssignedToUserIdArray())).thenReturn(users);

        List<Task> tasks = new ArrayList<>();
        for (int i = 0; i < 1000; i ++) {
            tasks.add(new Task());
        }
        when(taskRepository.search(any(TaskSearchCriteria.class), any(Boolean.class), any(Pageable.class))).thenReturn(new PageImpl<>(tasks, PageRequest.of(0, 1000), 2000));

        taskService.assignTask(taskAssignmentRequest);

        assertThat(tasks.get(0).getAssignedTo()).isIn(users);
        assertThat(tasks.get(1).getAssignedTo()).isIn(users);
        assertThat(tasks.get(2).getAssignedTo()).isIn(users);
        assertThat(tasks.get(3).getAssignedTo()).isIn(users);
    }

}