package org.avni.server.web.request;

import org.avni.server.domain.Card;
import org.avni.server.domain.DashboardSectionCardMapping;

public class CardContract extends CHSRequest {
    private String name;
    private String query;
    private String description;
    private String color;
    private Double displayOrder;
    private Long standardReportCardTypeId;
    private String iconFileS3Key;

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
        cardContract.setIconFileS3Key(card.getIconFileS3Key());
        return cardContract;
    }

    public static CardContract fromMapping(DashboardSectionCardMapping mapping) {
        CardContract cardContract = CardContract.fromEntity(mapping.getCard());
        cardContract.setDisplayOrder(mapping.getDisplayOrder());
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

    public String getIconFileS3Key() {
        return iconFileS3Key;
    }

    public void setIconFileS3Key(String iconFileS3Key) {
        this.iconFileS3Key = iconFileS3Key;
    }
}
