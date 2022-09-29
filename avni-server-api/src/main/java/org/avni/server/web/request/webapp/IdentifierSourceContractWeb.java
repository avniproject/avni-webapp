package org.avni.server.web.request.webapp;

import org.avni.server.domain.IdentifierSource;
import org.avni.server.domain.JsonObject;
import org.springframework.hateoas.core.Relation;

@Relation(collectionRelation = "identifierSource")
public class IdentifierSourceContractWeb {
    private Long batchGenerationSize;
    private Long minimumBalance;
    private String name;
    private JsonObject options;
    private String type;
    private Long catchmentId;
    private Integer minLength;
    private Integer maxLength;
    private boolean voided;
    private Long organisationId;
    private Long id;
    private String UUID;
    private String catchmentUUID;

    public String getCatchmentUUID() {
        return catchmentUUID;
    }

    public void setCatchmentUUID(String catchmentUUID) {
        this.catchmentUUID = catchmentUUID;
    }

    public String getUUID() { return this.UUID; }

    public void setUUID(String uuid) { this.UUID = uuid; }

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

    public Long getCatchmentId() {
        return catchmentId;
    }

    public void setCatchmentId(Long catchmentId) {
        this.catchmentId = catchmentId;
    }

    public Integer getMinLength() {
        return minLength;
    }

    public void setMinLength(Integer minLength) {
        this.minLength = minLength;
    }

    public Integer getMaxLength() {
        return maxLength;
    }

    public void setMaxLength(Integer maxLength) {
        this.maxLength = maxLength;
    }

    public static IdentifierSourceContractWeb fromIdentifierSource(IdentifierSource identifierSource) {
        IdentifierSourceContractWeb contract = new IdentifierSourceContractWeb();
        contract.setBatchGenerationSize(identifierSource.getBatchGenerationSize());
        if(identifierSource.getCatchment() != null)
            contract.setCatchmentId(identifierSource.getCatchment().getId());
        contract.setMaxLength(identifierSource.getMaxLength());
        contract.setMinLength(identifierSource.getMinLength());
        contract.setMinimumBalance(identifierSource.getMinimumBalance());
        contract.setName(identifierSource.getName());
        contract.setType(identifierSource.getType());
        contract.setOptions(identifierSource.getOptions());
        contract.setId(identifierSource.getId());
        contract.setVoided(identifierSource.isVoided());
        contract.setOrganisationId(identifierSource.getOrganisationId());
        contract.setUUID(identifierSource.getUuid());
        return contract;
    }

    public boolean isVoided() {
        return voided;
    }

    public void setVoided(boolean voided) {
        this.voided = voided;
    }

    public Long getOrganisationId() {
        return organisationId;
    }

    public void setOrganisationId(Long organisationId) {
        this.organisationId = organisationId;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }
}
