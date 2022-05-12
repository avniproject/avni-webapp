package org.avni.web.request;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import org.avni.application.Format;
import org.avni.domain.SubjectType;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({"name", "uuid"})
public class SubjectTypeContract extends ReferenceDataContract {

    @JsonProperty(value = "group")
    private boolean isGroup;

    @JsonProperty(value = "household")
    private boolean isHousehold;

    private Boolean active;

    private String type;

    private String subjectSummaryRule;

    private boolean allowEmptyLocation;

    private boolean uniqueName;

    private FormatContract validFirstNameFormat;
    private FormatContract validLastNameFormat;
    private String iconFileS3Key;
    @JsonProperty(value = "directlyAssignable")
    private boolean isDirectlyAssignable;
    private boolean shouldSyncByLocation;
    private String syncRegistrationConcept1;
    private String syncRegistrationConcept2;
    @JsonProperty(value = "syncRegistrationConcept1Usable")
    private Boolean isSyncRegistrationConcept1Usable;
    @JsonProperty(value = "syncRegistrationConcept2Usable")
    private Boolean isSyncRegistrationConcept2Usable;
    private String nameHelpText;

    public static SubjectTypeContract fromSubjectType(SubjectType subjectType) {
        SubjectTypeContract contract = new SubjectTypeContract();
        contract.setName(subjectType.getName());
        contract.setUuid(subjectType.getUuid());
        contract.setVoided(subjectType.isVoided());
        contract.setIsGroup(subjectType.isGroup());
        contract.setHousehold(subjectType.isHousehold());
        contract.setActive(subjectType.getActive());
        contract.setType(subjectType.getType().name());
        contract.setSubjectSummaryRule(subjectType.getSubjectSummaryRule());
        contract.setAllowEmptyLocation(subjectType.isAllowEmptyLocation());
        contract.setUniqueName(subjectType.isUniqueName());
        contract.setValidFirstNameFormat(FormatContract.fromFormat(subjectType.getValidFirstNameFormat()));
        contract.setValidLastNameFormat(FormatContract.fromFormat(subjectType.getValidLastNameFormat()));
        contract.setDirectlyAssignable(subjectType.isDirectlyAssignable());
        contract.setShouldSyncByLocation(subjectType.isShouldSyncByLocation());
        contract.setSyncRegistrationConcept1(subjectType.getSyncRegistrationConcept1());
        contract.setSyncRegistrationConcept1Usable(subjectType.isSyncRegistrationConcept1Usable());
        contract.setSyncRegistrationConcept2(subjectType.getSyncRegistrationConcept2());
        contract.setSyncRegistrationConcept2Usable(subjectType.isSyncRegistrationConcept2Usable());
        contract.setNameHelpText(subjectType.getNameHelpText());
        return contract;
    }

    public boolean isHousehold() {
        return isHousehold;
    }

    public void setHousehold(boolean household) {
        isHousehold = household;
    }

    public boolean isGroup() {
        return isGroup;
    }

    public void setIsGroup(boolean group) {
        isGroup = group;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getSubjectSummaryRule() {
        return subjectSummaryRule;
    }

    public void setSubjectSummaryRule(String subjectSummaryRule) {
        this.subjectSummaryRule = subjectSummaryRule;
    }

    public boolean isAllowEmptyLocation() {
        return allowEmptyLocation;
    }

    public void setAllowEmptyLocation(boolean allowEmptyLocation) {
        this.allowEmptyLocation = allowEmptyLocation;
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
        return isDirectlyAssignable;
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

    public Boolean getSyncRegistrationConcept1Usable() {
        return isSyncRegistrationConcept1Usable;
    }

    public void setSyncRegistrationConcept1Usable(Boolean syncRegistrationConcept1Usable) {
        isSyncRegistrationConcept1Usable = syncRegistrationConcept1Usable;
    }

    public Boolean getSyncRegistrationConcept2Usable() {
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
}
