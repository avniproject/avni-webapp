package org.avni.server.domain;


import org.hibernate.annotations.BatchSize;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

@Entity
@BatchSize(size = 100)
public class GroupDashboard extends  OrganisationAwareEntity {

    @Column
    private boolean isPrimaryDashboard;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "group_id")
    private Group group;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "dashboard_id")
    private Dashboard dashboard;

    public boolean isPrimaryDashboard() {
        return isPrimaryDashboard;
    }

    public void setPrimaryDashboard(boolean isPrimaryDashboard) {
        this.isPrimaryDashboard = isPrimaryDashboard;
    }

    public void setPrimaryDashboard(Boolean isPrimaryDashboard) {
        this.isPrimaryDashboard = isPrimaryDashboard;
    }

    public Group getGroup() {
        return group;
    }

    public void setGroup(Group group) {
        this.group = group;
    }

    public Dashboard getDashboard() {
        return dashboard;
    }

    public void setDashboard(Dashboard dashboard) {
        this.dashboard = dashboard;
    }
}
