package org.avni.server.domain.task;

import org.avni.server.domain.OrganisationAwareEntity;
import org.avni.server.domain.User;
import org.hibernate.annotations.BatchSize;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

@Entity
@Table(name = "task_unassignment")
@BatchSize(size = 100)
public class TaskUnAssignment extends OrganisationAwareEntity {
    @ManyToOne(targetEntity = Task.class, fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id")
    @NotNull
    private Task task;

    @ManyToOne(targetEntity = User.class, fetch = FetchType.LAZY)
    @JoinColumn(name = "unassigned_user_id")
    @NotNull
    private User unassignedUser;

    public Task getTask() {
        return task;
    }

    public void setTask(Task task) {
        this.task = task;
    }

    public User getUnassignedUser() {
        return unassignedUser;
    }

    public void setUnassignedUser(User unassignedUser) {
        this.unassignedUser = unassignedUser;
    }
}
