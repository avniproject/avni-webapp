package org.openchs.web.request.webapp;

import org.openchs.domain.OperationalSubjectType;
import org.springframework.hateoas.core.Relation;

/**
 * This class represents a combined entity representing one to one mapping of SubjectType and OperationalSubjectType.
 */
@Relation(collectionRelation = "subjectType")
public class SubjectTypeContractWeb {
    private String name;
    private Long id;
    private Long organisationId;
    private Long subjectTypeOrganisationId;
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

    public static SubjectTypeContractWeb fromOperationalSubjectType(OperationalSubjectType operationalSubjectType) {
        SubjectTypeContractWeb contract = new SubjectTypeContractWeb();
        contract.setId(operationalSubjectType.getId());
        contract.setName(operationalSubjectType.getName());
        contract.setOrganisationId(operationalSubjectType.getOrganisationId());
        contract.setSubjectTypeOrganisationId(operationalSubjectType.getSubjectType().getOrganisationId());
        contract.setVoided(operationalSubjectType.isVoided());
        return contract;
    }

    public boolean isVoided() {
        return voided;
    }

    public void setVoided(boolean voided) {
        this.voided = voided;
    }

    public Long getSubjectTypeOrganisationId() {
        return subjectTypeOrganisationId;
    }

    public void setSubjectTypeOrganisationId(Long subjectTypeOrganisationId) {
        this.subjectTypeOrganisationId = subjectTypeOrganisationId;
    }
}