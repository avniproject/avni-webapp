package org.avni.server.web.request.webapp;

import org.avni.server.application.Format;
import org.avni.server.domain.OperationalSubjectType;
import org.avni.server.domain.SubjectType;
import org.avni.server.web.request.FormatContract;
import org.avni.server.web.request.GroupRoleContract;
import org.joda.time.DateTime;
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
    private Boolean active;
    private String createdBy;
    private String lastModifiedBy;
    private DateTime createdDateTime;
    private DateTime lastModifiedDateTime;
    private String uuid;
    private List<GroupRoleContract> groupRoles;
    private String registrationFormUuid;
    private String type;
    private String subjectSummaryRule;
    private String programEligibilityCheckRule;
    private List<String> locationTypeUUIDs;
    private boolean allowEmptyLocation;
    private boolean allowProfilePicture;
    private boolean uniqueName;
    private boolean allowMiddleName;
    private FormatContract validFirstNameFormat;
    private FormatContract validMiddleNameFormat;
    private FormatContract validLastNameFormat;
    private String iconFileS3Key;
    private boolean isDirectlyAssignable;
    private boolean shouldSyncByLocation;
    private String syncRegistrationConcept1;
    private String syncRegistrationConcept2;
    private Boolean isSyncRegistrationConcept1Usable;
    private Boolean isSyncRegistrationConcept2Usable;
    private String nameHelpText;
    private Long subjectTypeId;

    public static SubjectTypeContractWeb fromOperationalSubjectType(OperationalSubjectType operationalSubjectType) {
        SubjectTypeContractWeb contract = new SubjectTypeContractWeb();
        SubjectType subjectType = operationalSubjectType.getSubjectType();
        contract.setId(operationalSubjectType.getId());
        contract.setName(operationalSubjectType.getName());
        contract.setUUID(operationalSubjectType.getSubjectTypeUUID());
        contract.setOrganisationId(operationalSubjectType.getOrganisationId());
        contract.setSubjectTypeOrganisationId(subjectType.getOrganisationId());
        contract.setVoided(operationalSubjectType.isVoided());
        contract.setCreatedBy(operationalSubjectType.getCreatedBy().getUsername());
        contract.setLastModifiedBy(operationalSubjectType.getLastModifiedBy().getUsername());
        contract.setCreatedDateTime(operationalSubjectType.getCreatedDateTime());
        contract.setModifiedDateTime(operationalSubjectType.getLastModifiedDateTime());
        contract.setGroup(operationalSubjectType.isGroup());
        contract.setHousehold(operationalSubjectType.isHousehold());
        contract.setGroupRoles(subjectType.getGroupRolesContract());
        contract.setActive(subjectType.getActive());
        contract.setAllowEmptyLocation(subjectType.isAllowEmptyLocation());
        contract.setAllowProfilePicture(subjectType.isAllowProfilePicture());
        contract.setUniqueName(subjectType.isUniqueName());
        contract.setType(operationalSubjectType.getType().name());
        contract.setSubjectSummaryRule(operationalSubjectType.getSubjectSummaryRule());
        contract.setProgramEligibilityCheckRule(operationalSubjectType.getProgramEligibilityCheckRule());
        contract.setValidFirstNameFormat(FormatContract.fromFormat(operationalSubjectType.getValidFirstNameFormat()));
        contract.setAllowMiddleName(operationalSubjectType.getSubjectType().isAllowMiddleName());
        contract.setValidMiddleNameFormat(FormatContract.fromFormat(operationalSubjectType.getSubjectType().getValidMiddleNameFormat()));
        contract.setValidLastNameFormat(FormatContract.fromFormat(operationalSubjectType.getValidLastNameFormat()));
        contract.setIconFileS3Key(subjectType.getIconFileS3Key());
        contract.setDirectlyAssignable(subjectType.isDirectlyAssignable());
        contract.setShouldSyncByLocation(subjectType.isShouldSyncByLocation());
        contract.setSyncRegistrationConcept1(subjectType.getSyncRegistrationConcept1());
        contract.setSyncRegistrationConcept2(subjectType.getSyncRegistrationConcept2());
        contract.setSyncRegistrationConcept1Usable(subjectType.isSyncRegistrationConcept1Usable());
        contract.setSyncRegistrationConcept2Usable(subjectType.isSyncRegistrationConcept2Usable());
        contract.setNameHelpText(subjectType.getNameHelpText());
        contract.setSubjectTypeId(subjectType.getId());

        return contract;
    }

    public List<String> getLocationTypeUUIDs() {
        return locationTypeUUIDs;
    }

    public void setLocationTypeUUIDs(List<String> locationTypeUUIDs) {
        this.locationTypeUUIDs = locationTypeUUIDs;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
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

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public String getSubjectSummaryRule() {
        return subjectSummaryRule;
    }

    public void setSubjectSummaryRule(String subjectSummaryRule) {
        this.subjectSummaryRule = subjectSummaryRule;
    }

    public String getProgramEligibilityCheckRule() {
        return programEligibilityCheckRule;
    }

    public void setProgramEligibilityCheckRule(String programEligibilityCheckRule) {
        this.programEligibilityCheckRule = programEligibilityCheckRule;
    }

    public boolean isAllowEmptyLocation() {
        return allowEmptyLocation;
    }

    public void setAllowEmptyLocation(boolean allowEmptyLocation) {
        this.allowEmptyLocation = allowEmptyLocation;
    }

    public boolean isAllowProfilePicture() {
        return allowProfilePicture;
    }

    public void setAllowProfilePicture(boolean allowProfilePicture) {
        this.allowProfilePicture = allowProfilePicture;
    }

    public boolean isUniqueName() {
        return uniqueName;
    }

    public void setUniqueName(boolean uniqueName) {
        this.uniqueName = uniqueName;
    }

    public Format getValidFirstNameFormat() {
        return validFirstNameFormat == null ? null : validFirstNameFormat.toFormat();
    }

    public void setValidFirstNameFormat(FormatContract validFirstNameFormat) {
        this.validFirstNameFormat = validFirstNameFormat;
    }

    public Format getValidLastNameFormat() {
        return validLastNameFormat == null ? null : validLastNameFormat.toFormat();
    }

    public void setValidLastNameFormat(FormatContract validLastNameFormat) {
        this.validLastNameFormat = validLastNameFormat;
    }

    public String getIconFileS3Key() {
        return iconFileS3Key;
    }

    public void setIconFileS3Key(String iconFileS3Key) {
        this.iconFileS3Key = iconFileS3Key;
    }

    public boolean isDirectlyAssignable() {
        return  isDirectlyAssignable;
    }

    public void setDirectlyAssignable(boolean directlyAssignable) {
        isDirectlyAssignable = directlyAssignable;
    }

    public boolean isShouldSyncByLocation() {
        return shouldSyncByLocation;
    }

    public void setShouldSyncByLocation(boolean shouldSyncByLocation) {
        this.shouldSyncByLocation = shouldSyncByLocation;
    }

    public String getSyncRegistrationConcept1() {
        return syncRegistrationConcept1;
    }

    public void setSyncRegistrationConcept1(String syncRegistrationConcept1) {
        this.syncRegistrationConcept1 = syncRegistrationConcept1;
    }

    public String getSyncRegistrationConcept2() {
        return syncRegistrationConcept2;
    }

    public void setSyncRegistrationConcept2(String syncRegistrationConcept2) {
        this.syncRegistrationConcept2 = syncRegistrationConcept2;
    }

    public Boolean isSyncRegistrationConcept1Usable() {
        return isSyncRegistrationConcept1Usable;
    }

    public void setSyncRegistrationConcept1Usable(Boolean syncRegistrationConcept1Usable) {
        isSyncRegistrationConcept1Usable = syncRegistrationConcept1Usable;
    }

    public Boolean isSyncRegistrationConcept2Usable() {
        return isSyncRegistrationConcept2Usable;
    }

    public void setSyncRegistrationConcept2Usable(Boolean syncRegistrationConcept2Usable) {
        isSyncRegistrationConcept2Usable = syncRegistrationConcept2Usable;
    }

    public String getNameHelpText() {
        return nameHelpText;
    }

    public void setNameHelpText(String nameHelpText) {
        this.nameHelpText = nameHelpText;
    }

    public boolean isAllowMiddleName() {
        return allowMiddleName;
    }

    public void setAllowMiddleName(boolean allowMiddleName) {
        this.allowMiddleName = allowMiddleName;
    }

    public Format getValidMiddleNameFormat() {
        return validMiddleNameFormat == null ? null : validMiddleNameFormat.toFormat();
    }

    public void setValidMiddleNameFormat(FormatContract validMiddleNameFormat) {
        this.validMiddleNameFormat = validMiddleNameFormat;
    }

    public Long getSubjectTypeId() {
        return subjectTypeId;
    }

    public void setSubjectTypeId(Long subjectTypeId) {
        this.subjectTypeId = subjectTypeId;
    }
}
