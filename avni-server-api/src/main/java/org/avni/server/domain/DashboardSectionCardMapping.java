package org.avni.server.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.hibernate.annotations.BatchSize;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

@Entity
@Table(name = "dashboard_section_card_mapping")
@BatchSize(size = 100)
@JsonIgnoreProperties({"dashboardSection", "card"})
public class DashboardSectionCardMapping extends OrganisationAwareEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dashboard_section_id")
    private DashboardSection dashboardSection;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "card_id")
    private Card card;

    @NotNull
    private Double displayOrder;

    public DashboardSection getDashboardSection() {
        return dashboardSection;
    }

    public void setDashboardSection(DashboardSection dashboardSection) {
        this.dashboardSection = dashboardSection;
    }

    public Card getCard() {
        return card;
    }

    public void setCard(Card card) {
        this.card = card;
    }

    public Double getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Double displayOrder) {
        this.displayOrder = displayOrder;
    }
}
