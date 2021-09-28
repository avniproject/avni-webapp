package org.avni.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.hibernate.annotations.BatchSize;
import org.avni.web.request.CHSRequest;
import org.avni.web.request.CardContract;
import org.avni.web.request.DashboardContract;
import org.avni.web.request.DashboardSectionContract;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Entity
@Table(name = "dashboard")
@BatchSize(size = 100)
@JsonIgnoreProperties({"dashboardSections"})
public class Dashboard extends OrganisationAwareEntity {

    @NotNull
    private String name;

    private String description;

    @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true, mappedBy = "dashboard")
    private Set<DashboardSection> dashboardSections = new HashSet<>();

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Set<DashboardSection> getDashboardSections() {
        return dashboardSections;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setDashboardSections(Set<DashboardSection> dashboardSections) {
        this.dashboardSections.clear();
        this.dashboardSections.addAll(dashboardSections);
    }
}
