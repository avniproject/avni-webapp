package org.avni.domain.task;

import org.avni.domain.OrganisationAwareEntity;
import org.avni.domain.User;
import org.hibernate.annotations.BatchSize;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

@Entity
@Table(name = "task_migration")
@BatchSize(size = 100)
public class TaskMigration extends OrganisationAwareEntity {
    @ManyToOne(targetEntity = Task.class, fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id")
    @NotNull
    private Task task;

    @ManyToOne(targetEntity = User.class, fetch = FetchType.LAZY)
    @JoinColumn(name = "old_assigned_user_id")
    @NotNull
    private User oldAssigned;

    @ManyToOne(targetEntity = User.class, fetch = FetchType.LAZY)
    @JoinColumn(name = "new_assigned_user_id")
    @NotNull
    private User newAssigned;
}
