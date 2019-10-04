package org.openchs.web.request.webapp;

import org.openchs.domain.OperationalProgram;
import org.springframework.hateoas.core.Relation;

/**
 * This class represents a combined entity representing one to one mapping of Program and OperationalProgram.
 */
@Relation(collectionRelation = "program")
public class ProgramContractWeb {
    private String name;
    private String programSubjectLabel;
    private String colour;
    private Long id;
    private Long organisationId;
    private boolean voided;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getProgramSubjectLabel() {
        return programSubjectLabel;
    }

    public void setProgramSubjectLabel(String programSubjectLabel) {
        this.programSubjectLabel = programSubjectLabel;
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

    public String getColour() {
        return colour;
    }

    public void setColour(String colour) {
        this.colour = colour;
    }

    public static ProgramContractWeb fromOperationalProgram(OperationalProgram operationalProgram) {
        ProgramContractWeb contract = new ProgramContractWeb();

        contract.setId(operationalProgram.getId());
        contract.setName(operationalProgram.getName());
        contract.setColour(operationalProgram.getProgram().getColour());
        contract.setProgramSubjectLabel(operationalProgram.getProgramSubjectLabel());
        contract.setOrganisationId(operationalProgram.getOrganisationId());
        contract.setVoided(operationalProgram.isVoided());

        return contract;
    }


    public boolean isVoided() {
        return voided;
    }

    public void setVoided(boolean voided) {
        this.voided = voided;
    }
}