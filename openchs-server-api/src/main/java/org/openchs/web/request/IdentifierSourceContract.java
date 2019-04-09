package org.openchs.web.request;

import org.openchs.domain.JsonObject;

public class IdentifierSourceContract extends CHSRequest {
    private Long batchGenerationSize;
    private Long minimumBalance;
    private String name;
    private JsonObject options;
    private String type;
    private String catchmentUUID;
    private String facilityUUID;

    public Long getBatchGenerationSize() {
        return batchGenerationSize;
    }

    public void setBatchGenerationSize(Long batchGenerationSize) {
        this.batchGenerationSize = batchGenerationSize;
    }

    public Long getMinimumBalance() {
        return minimumBalance;
    }

    public void setMinimumBalance(Long minimumBalance) {
        this.minimumBalance = minimumBalance;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public JsonObject getOptions() {
        return options;
    }

    public void setOptions(JsonObject options) {
        this.options = options;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getCatchmentUUID() {
        return catchmentUUID;
    }

    public void setCatchmentUUID(String catchmentUUID) {
        this.catchmentUUID = catchmentUUID;
    }

    public String getFacilityUUID() {
        return facilityUUID;
    }

    public void setFacilityUUID(String facilityUUID) {
        this.facilityUUID = facilityUUID;
    }
}
