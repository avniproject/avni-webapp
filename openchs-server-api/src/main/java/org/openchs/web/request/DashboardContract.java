package org.openchs.web.request;

import org.openchs.domain.Dashboard;

import java.util.ArrayList;
import java.util.List;

public class DashboardContract extends CHSRequest {

    private String name;
    private String description;
    private List<CardContract> cards = new ArrayList<>();

    public static DashboardContract fromEntity(Dashboard dashboard) {
        DashboardContract dashboardContract = new DashboardContract();
        dashboardContract.setId(dashboard.getId());
        dashboardContract.setUuid(dashboard.getUuid());
        dashboardContract.setVoided(dashboard.isVoided());
        dashboardContract.setName(dashboard.getName());
        dashboardContract.setDescription(dashboard.getDescription());
        dashboardContract.setCards(dashboard.getCards());
        return dashboardContract;
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

    public List<CardContract> getCards() {
        return cards;
    }

    public void setCards(List<CardContract> cards) {
        this.cards = cards;
    }
}
