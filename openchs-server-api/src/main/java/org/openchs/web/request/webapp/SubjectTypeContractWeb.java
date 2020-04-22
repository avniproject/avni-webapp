package org.openchs.web.request.webapp;

import org.joda.time.DateTime;
import org.openchs.domain.OperationalSubjectType;
import org.springframework.hateoas.core.Relation;

import java.util.List;

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
    private boolean group;
    private boolean household;
    private String createdBy;
    private String lastModifiedBy;
    private DateTime createdDateTime;
    private DateTime lastModifiedDateTime;
    private String uuid;
    private List<GroupRoleContract> groupRoles;
    private String registrationFormUuid;

    public static SubjectTypeContractWeb fromOperationalSubjectType(OperationalSubjectType operationalSubjectType) {
        SubjectTypeContractWeb contract = new SubjectTypeContractWeb();
        contract.setId(operationalSubjectType.getId());
        contract.setName(operationalSubjectType.getName());
        contract.setUUID(operationalSubjectType.getSubjectTypeUUID());
        contract.setOrganisationId(operationalSubjectType.getOrganisationId());
        contract.setSubjectTypeOrganisationId(operationalSubjectType.getSubjectType().getOrganisationId());
        contract.setVoided(operationalSubjectType.isVoided());
        contract.setCreatedBy(operationalSubjectType.getAudit().getCreatedBy().getUsername());
        contract.setLastModifiedBy(operationalSubjectType.getAudit().getLastModifiedBy().getUsername());
        contract.setCreatedDateTime(operationalSubjectType.getAudit().getCreatedDateTime());
        contract.setModifiedDateTime(operationalSubjectType.getAudit().getLastModifiedDateTime());
        contract.setGroup(operationalSubjectType.isGroup());
        contract.setHousehold(operationalSubjectType.isHousehold());
        contract.setGroupRoles(operationalSubjectType.getSubjectType().getGroupRolesContract());
        return contract;
    }

    public List<GroupRoleContract> getGroupRoles() {
        return groupRoles;
    }

    public void setGroupRoles(List<GroupRoleContract> groupRoles) {
        this.groupRoles = groupRoles;
    }

    public boolean isHousehold() {
        return household;
    }

    public void setHousehold(boolean household) {
        this.household = household;
    }

    public boolean isGroup() {
        return group;
    }

    public void setGroup(boolean group) {
        this.group = group;
    }

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

    public String getUUID(){
        return uuid;
    }

    public void setUUID(String uuid){
        this.uuid=uuid;
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

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String username) {
        this.createdBy = username;
    }

    public String getLastModifiedBy() {
        return lastModifiedBy;
    }

    public void setLastModifiedBy(String username) {
        this.lastModifiedBy = username;
    }

    public DateTime getCreatedDateTime() {
        return createdDateTime;
    }

    public void setCreatedDateTime(DateTime createDateTime) {
        this.createdDateTime = createDateTime;
    }

    public DateTime getModifiedDateTime() {
        return lastModifiedDateTime;
    }

    public void setModifiedDateTime(DateTime lastModifiedDateTime) {
        this.lastModifiedDateTime = lastModifiedDateTime;
    }

    public String getRegistrationFormUuid() {
        return registrationFormUuid;
    }

    public void setRegistrationFormUuid(String registrationFormUuid) {
        this.registrationFormUuid = registrationFormUuid;
    }
}
