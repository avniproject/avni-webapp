package org.openchs.web.request.webapp;

import org.openchs.domain.OperationalEncounterType;
import org.springframework.hateoas.core.Relation;
import org.joda.time.DateTime;


/**
 * This class represents a combined entity representing one to one mapping of EncounterType and OperationalEncounterType.
 */
@Relation(collectionRelation = "encounterType")
public class EncounterTypeContractWeb {
    private String name;
    private Long id;
    private Long organisationId;
    private Long encounterTypeOrganisationId;
    private boolean voided;
    private String encounterEligibilityCheckRule;
    private String createdBy;
    private String lastModifiedBy;
    private DateTime createdDateTime;
    private DateTime lastModifiedDateTime;
    private String uuid;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getOrganisationId() {
        return organisationId;
    }

    public void setOrganisationId(Long organisationId) {
        this.organisationId = organisationId;
    }

    public void setUUID(String uuid){
        this.uuid = uuid;
    }

    public String getUUID(){
        return uuid;
    }

    public static EncounterTypeContractWeb fromOperationalEncounterType(OperationalEncounterType operationalEncounterType) {
        EncounterTypeContractWeb contract = new EncounterTypeContractWeb();
        contract.setId(operationalEncounterType.getId());
        contract.setName(operationalEncounterType.getName());
        contract.setOrganisationId(operationalEncounterType.getOrganisationId());
        contract.setUUID(operationalEncounterType.getEncounterType().getUuid());
        contract.setEncounterTypeOrganisationId(operationalEncounterType.getEncounterType().getOrganisationId());
        contract.setVoided(operationalEncounterType.isVoided());
        contract.setEncounterEligibilityCheckRule(operationalEncounterType.getEncounterEligibilityCheckRule());
        contract.setCreatedBy(operationalEncounterType.getAudit().getCreatedBy().getUsername());
        contract.setLastModifiedBy(operationalEncounterType.getAudit().getLastModifiedBy().getUsername());
        contract.setCreatedDateTime(operationalEncounterType.getAudit().getCreatedDateTime());
        contract.setModifiedDateTime(operationalEncounterType.getAudit().getLastModifiedDateTime());
        return contract;
    }

    public boolean isVoided() {
        return voided;
    }

    public void setVoided(boolean voided) {
        this.voided = voided;
    }

    public Long getEncounterTypeOrganisationId() {
        return encounterTypeOrganisationId;
    }

    public void setEncounterTypeOrganisationId(Long encounterTypeOrganisationId) {
        this.encounterTypeOrganisationId = encounterTypeOrganisationId;
    }

    public String getEncounterEligibilityCheckRule() {
        return encounterEligibilityCheckRule;
    }

    public void setEncounterEligibilityCheckRule(String encounterEligibilityCheckRule) {
        this.encounterEligibilityCheckRule = encounterEligibilityCheckRule;
    }

    public void setCreatedBy(String username){
        this.createdBy = username;
    }
    public String getCreatedBy(){
        return createdBy;
    }

    public void setLastModifiedBy(String username){
        this.lastModifiedBy = username;
    }

    public String getLastModifiedBy(){
        return lastModifiedBy;
    }


    public void setCreatedDateTime(DateTime createDateTime){
        this.createdDateTime = createDateTime;
    }

    public DateTime getCreatedDateTime(){
        return createdDateTime;
    }

    public void setModifiedDateTime(DateTime lastModifiedDateTime){
        this.lastModifiedDateTime = lastModifiedDateTime;
    }

    public DateTime getModifiedDateTime(){
        return lastModifiedDateTime;
    }
}