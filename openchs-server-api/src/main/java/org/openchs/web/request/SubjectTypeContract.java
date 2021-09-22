package org.openchs.web.request;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import org.openchs.application.Format;
import org.openchs.domain.SubjectType;

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
}
