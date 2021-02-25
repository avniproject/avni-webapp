package org.openchs.web.request;

import org.openchs.domain.Dashboard;
import org.openchs.domain.DashboardSection;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class DashboardSectionContract extends CHSRequest {

    private String name;
    private String description;
    private String viewType;
    private Double displayOrder;
    private List<CardContract> cards = new ArrayList<>();

    public static DashboardSectionContract fromEntity(DashboardSection ds) {
        DashboardSectionContract dashboardContract = new DashboardSectionContract();
        dashboardContract.setId(ds.getId());
        dashboardContract.setUuid(ds.getUuid());
        dashboardContract.setVoided(ds.isVoided());
        dashboardContract.setName(ds.getName());
        dashboardContract.setDescription(ds.getDescription());
        setCards(dashboardContract, ds);
        return dashboardContract;
    }

    private static void setCards(DashboardSectionContract contract, DashboardSection ds) {
        List<CardContract> list = ds.getDashboardSectionCardMappings().stream()
                .filter(c -> !c.isVoided())
                .map(CardContract::fromMapping)
                .collect(Collectors.toList());
        contract.setCards(list);
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

    public String getViewType() {
        return viewType;
    }

    public void setViewType(String viewType) {
        this.viewType = viewType;
    }

    public Double getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Double displayOrder) {
        this.displayOrder = displayOrder;
    }
}
