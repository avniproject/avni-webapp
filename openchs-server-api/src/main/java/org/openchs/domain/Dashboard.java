package org.openchs.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.hibernate.annotations.BatchSize;
import org.openchs.web.request.CardContract;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Entity
@Table(name = "dashboard")
@BatchSize(size = 100)
@JsonIgnoreProperties({"dashboardCardMappings"})
public class Dashboard extends OrganisationAwareEntity {

    @NotNull
    private String name;

    private String description;

    @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true, mappedBy = "dashboard")
    private Set<DashboardCardMapping> dashboardCardMappings = new HashSet<>();

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Set<DashboardCardMapping> getDashboardCardMappings() {
        return dashboardCardMappings;
    }

    public void setDashboardCardMappings(Set<DashboardCardMapping> dashboardCardMappings) {
        this.dashboardCardMappings.clear();
        if (dashboardCardMappings != null) {
            this.dashboardCardMappings.addAll(dashboardCardMappings);
        }
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<CardContract> getCards() {
        Set<DashboardCardMapping> dashboardCardMappings = getDashboardCardMappings();
        return dashboardCardMappings.stream()
                .map(this::buildCardContract)
                .collect(Collectors.toList());
    }

    private CardContract buildCardContract(DashboardCardMapping dashboardCardMapping) {
        CardContract cardContract = CardContract.fromEntity(dashboardCardMapping.getCard());
        cardContract.setDisplayOrder(dashboardCardMapping.getDisplayOrder());
        return cardContract;
    }
}
