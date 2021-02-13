package org.openchs.web.request;

import org.openchs.domain.Card;

public class CardContract extends CHSRequest {
    private String name;
    private String query;
    private String description;
    private String color;
    private Double displayOrder;
    private Long standardReportCardTypeId;

    public static CardContract fromEntity(Card card) {
        CardContract cardContract = new CardContract();
        cardContract.setId(card.getId());
        cardContract.setUuid(card.getUuid());
        cardContract.setVoided(card.isVoided());
        cardContract.setName(card.getName());
        cardContract.setQuery(card.getQuery());
        cardContract.setDescription(card.getDescription());
        cardContract.setColor(card.getColour());
        cardContract.setStandardReportCardTypeId(card.getStandardReportCardTypeId());
        return cardContract;
    }

    public Long getStandardReportCardTypeId() {
        return standardReportCardTypeId;
    }

    public void setStandardReportCardTypeId(Long standardReportCardTypeId) {
        this.standardReportCardTypeId = standardReportCardTypeId;
    }

    public Double getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Double displayOrder) {
        this.displayOrder = displayOrder;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getQuery() {
        return query;
    }

    public void setQuery(String query) {
        this.query = query;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }


}
