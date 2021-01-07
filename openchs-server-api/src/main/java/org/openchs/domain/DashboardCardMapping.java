package org.openchs.domain;


import org.hibernate.annotations.BatchSize;

import javax.persistence.*;


@Entity
@Table(name = "dashboard_card_mapping")
@BatchSize(size = 100)
public class DashboardCardMapping extends OrganisationAwareEntity {

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "dashboard_id")
    private Dashboard dashboard;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "card_id")
    private Card card;

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

    public Card getCard() {
        return card;
    }

    public void setCard(Card card) {
        this.card = card;
    }
}
