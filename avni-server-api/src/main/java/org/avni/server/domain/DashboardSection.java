package org.avni.server.domain;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.hibernate.annotations.BatchSize;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.HashSet;
import java.util.Set;


@Entity
@Table(name = "dashboard_section")
@BatchSize(size = 100)
@JsonIgnoreProperties({"dashboard", "dashboardSectionCardMappings"})
public class DashboardSection extends OrganisationAwareEntity {

    @Column
    private String name;

    @Column
    private String description;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dashboard_id")
    private Dashboard dashboard;

    @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true, mappedBy = "dashboardSection")
    private Set<DashboardSectionCardMapping> dashboardSectionCardMappings = new HashSet<>();

    @NotNull
    @Column
    @Enumerated(EnumType.STRING)
    private DashboardSection.ViewType viewType;

    private Double displayOrder;

    public Double getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Double displayOrder) {
        this.displayOrder = displayOrder;
    }

    public Dashboard getDashboard() {
        return dashboard;
    }

    public void setDashboard(Dashboard dashboard) {
        this.dashboard = dashboard;
    }

    public String getDashboardUUID() {
        return dashboard.getUuid();
    }

    public ViewType getViewType() {
        return viewType;
    }

    public void setViewType(ViewType viewType) {
        this.viewType = viewType;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Set<DashboardSectionCardMapping> getDashboardSectionCardMappings() {
        return dashboardSectionCardMappings;
    }

    public void setDashboardSectionCardMappings(Set<DashboardSectionCardMapping> dashboardSectionCardMappings) {
        this.dashboardSectionCardMappings.addAll(dashboardSectionCardMappings);
    }

    public enum ViewType {
        Default,
        Tile,
        List
    }
}
