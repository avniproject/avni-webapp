package org.avni.server.web.task;

import org.avni.server.dao.task.TaskUnAssignmentRepository;
import org.avni.server.domain.CHSEntity;
import org.avni.server.domain.User;
import org.avni.server.domain.task.TaskUnAssignment;
import org.avni.server.framework.security.UserContextHolder;
import org.avni.server.web.AbstractController;
import org.avni.server.web.RestControllerResourceProcessor;
import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.hateoas.Link;
import org.springframework.hateoas.PagedResources;
import org.springframework.hateoas.Resource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.transaction.Transactional;

@RestController
public class TaskUnAssignmentController extends AbstractController<TaskUnAssignment> implements RestControllerResourceProcessor<TaskUnAssignment> {

    private final TaskUnAssignmentRepository taskUnAssignmentRepository;

    @Autowired
    public TaskUnAssignmentController(TaskUnAssignmentRepository taskUnAssignmentRepository) {
        this.taskUnAssignmentRepository = taskUnAssignmentRepository;
    }

    @RequestMapping(value = "/taskUnAssignments", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    @Transactional
    public PagedResources<Resource<TaskUnAssignment>> getTasks(
            @RequestParam("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime,
            @RequestParam("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime now,
            Pageable pageable) {
        User user = UserContextHolder.getUserContext().getUser();
        return wrap(taskUnAssignmentRepository.findByUnassignedUserAndLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(user, CHSEntity.toDate(lastModifiedDateTime), CHSEntity.toDate(now), pageable));
    }

    @Override
    public Resource<TaskUnAssignment> process(Resource<TaskUnAssignment> resource) {
        TaskUnAssignment taskUnAssignment = resource.getContent();
        resource.add(new Link(taskUnAssignment.getTask().getUuid(), "taskUUID"));
        return resource;
    }
}
