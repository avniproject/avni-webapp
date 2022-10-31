package org.avni.server.web.request;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.avni.server.domain.StandardReportCardType;

import org.joda.time.DateTime;

@JsonInclude(JsonInclude.Include.NON_DEFAULT)
public class StandardReportCardTypeContract {
    private Long id;
    private String uuid;
    private String name;
    private String description;
    @JsonInclude(JsonInclude.Include.NON_DEFAULT)
    private boolean isVoided = false;
    private DateTime createdDateTime;
    private DateTime lastModifiedDateTime;

    public static StandardReportCardTypeContract fromEntity(StandardReportCardType standardReportCardType) {
        StandardReportCardTypeContract contract = new StandardReportCardTypeContract();
        contract.setId(standardReportCardType.getId());
        contract.setUuid(standardReportCardType.getUuid());
        contract.setVoided(standardReportCardType.isVoided());
        contract.setName(standardReportCardType.getName());
        contract.setDescription(standardReportCardType.getDescription());
        contract.setCreatedDateTime(standardReportCardType.getCreatedDateTime());
        contract.setLastModifiedDateTime(standardReportCardType.getLastModifiedDateTime());
        return contract;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUuid() {
        return uuid;
    }

    public void setUuid(String uuid) {
        this.uuid = uuid;
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

    public boolean isVoided() {
        return isVoided;
    }

    public void setVoided(boolean voided) {
        isVoided = voided;
    }

    public DateTime getCreatedDateTime() {
        return createdDateTime;
    }

    public void setCreatedDateTime(DateTime createdDateTime) {
        this.createdDateTime = createdDateTime;
    }

    public DateTime getLastModifiedDateTime() {
        return lastModifiedDateTime;
    }

    public void setLastModifiedDateTime(DateTime lastModifiedDateTime) {
        this.lastModifiedDateTime = lastModifiedDateTime;
    }
}
