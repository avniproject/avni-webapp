package org.openchs.web.request.webapp;

import org.openchs.domain.OperationalEncounterType;
import org.springframework.hateoas.core.Relation;

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

    public static EncounterTypeContractWeb fromOperationalEncounterType(OperationalEncounterType operationalEncounterType) {
        EncounterTypeContractWeb contract = new EncounterTypeContractWeb();
        contract.setId(operationalEncounterType.getId());
        contract.setName(operationalEncounterType.getName());
        contract.setOrganisationId(operationalEncounterType.getOrganisationId());
        contract.setEncounterTypeOrganisationId(operationalEncounterType.getEncounterType().getOrganisationId());
        contract.setVoided(operationalEncounterType.isVoided());
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
}