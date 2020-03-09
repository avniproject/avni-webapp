package org.openchs.web.request.webapp;

import org.openchs.domain.IdentifierUserAssignment;
import org.openchs.web.request.CHSRequest;
import org.openchs.domain.JsonObject;
import org.springframework.hateoas.core.Relation;

@Relation(collectionRelation = "identifierUserAssignment")
public class IdentifierUserAssignmentContractWeb {
    private Long identifierSourceId;
    private String identifierStart;
    private String identifierEnd;
    private Long userId;
    private boolean voided;
    private Long organisationId;
    private Long id;

    public Long getIdentifierSourceId() {
        return identifierSourceId;
    }

    public void setIdentifierSourceId(Long identifierSourceId) {
        this.identifierSourceId = identifierSourceId;
    }

    public String getIdentifierStart() {
        return identifierStart;
    }

    public void setIdentifierStart(String identifierStart) {
        this.identifierStart = identifierStart;
    }

    public String getIdentifierEnd() {
        return identifierEnd;
    }

    public void setIdentifierEnd(String identifierEnd) {
        this.identifierEnd = identifierEnd;
    }

    public void setUserId(Long userId){
        this.userId = userId;
    }

    public Long getUserId(){ return this.userId; }

    public static IdentifierUserAssignmentContractWeb fromIdentifierUserAssignment(IdentifierUserAssignment identifierUserAssignment) {
        IdentifierUserAssignmentContractWeb contract = new IdentifierUserAssignmentContractWeb();
        if(identifierUserAssignment.getAssignedTo() != null)
            contract.setUserId(identifierUserAssignment.getAssignedTo().getId());
        if(identifierUserAssignment.getIdentifierSource() != null)
            contract.setIdentifierSourceId(identifierUserAssignment.getIdentifierSource().getId());
        contract.setIdentifierStart(identifierUserAssignment.getIdentifierStart());
        contract.setIdentifierEnd(identifierUserAssignment.getIdentifierEnd());
        contract.setVoided(identifierUserAssignment.isVoided());
        contract.setId(identifierUserAssignment.getId());
        contract.setOrganisationId(identifierUserAssignment.getOrganisationId());
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
