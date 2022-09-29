package org.avni.server.web.request.webapp;

import org.avni.server.domain.IdentifierSource;
import org.avni.server.domain.IdentifierUserAssignment;
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
    private String name;
    private String userName;

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
        if(identifierUserAssignment.getAssignedTo() != null) {
            contract.setUserId(identifierUserAssignment.getAssignedTo().getId());
            contract.setUserName(identifierUserAssignment.getAssignedTo().getUsername());
        }
        IdentifierSource identifierSource = identifierUserAssignment.getIdentifierSource();
        if(identifierSource != null) {
            contract.setIdentifierSourceId(identifierSource.getId());
            contract.setName(identifierSource.getName());
        }
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

    public void setName(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserName() {
        return userName;
    }
}
