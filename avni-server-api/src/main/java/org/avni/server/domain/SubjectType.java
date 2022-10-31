package org.avni.server.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.DynamicInsert;
import org.avni.server.application.Format;
import org.avni.server.application.Subject;
import org.avni.server.application.projections.BaseProjection;
import org.avni.server.web.request.GroupRoleContract;
import org.hibernate.annotations.Type;
import org.springframework.data.rest.core.config.Projection;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.*;
import java.util.stream.Collectors;

@Entity
@Table(name = "subject_type")
@JsonIgnoreProperties({"operationalSubjectTypes"})
@DynamicInsert
@BatchSize(size = 100)
public class SubjectType extends OrganisationAwareEntity {
    @NotNull
    @Column
    private String name;

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "subjectType")
    private Set<OperationalSubjectType> operationalSubjectTypes = new HashSet<>();

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "groupSubjectType")
    private Set<GroupRole> groupRoles = new HashSet<>();

    @Column
    private boolean isGroup;

    @Column
    private boolean isHousehold;

    @Column
    @Enumerated(EnumType.STRING)
    private Subject type;

    private Boolean active;

    @Column(name = "subject_summary_rule")
    private String subjectSummaryRule;

    private boolean allowEmptyLocation;

    private boolean uniqueName;

    private boolean allowProfilePicture;

    @Column(name = "icon_file_s3_key")
    private String iconFileS3Key;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "regex",
                    column = @Column(name = "valid_first_name_regex")),
            @AttributeOverride(name = "descriptionKey",
                    column = @Column(name = "valid_first_name_description_key"))
    })
    private Format validFirstNameFormat;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "regex",
                    column = @Column(name = "valid_middle_name_regex")),
            @AttributeOverride(name = "descriptionKey",
                    column = @Column(name = "valid_middle_name_description_key"))
    })
    private Format validMiddleNameFormat;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "regex",
                    column = @Column(name = "valid_last_name_regex")),
            @AttributeOverride(name = "descriptionKey",
                    column = @Column(name = "valid_last_name_description_key"))
    })
    private Format validLastNameFormat;

    @Column(name = "directly_assignable")
    private boolean isDirectlyAssignable;

    @Column(name = "should_sync_by_location")
    private boolean shouldSyncByLocation;

    @Column(name = "sync_registration_concept_1")
    private String syncRegistrationConcept1;

    @Column(name = "sync_registration_concept_2")
    private String syncRegistrationConcept2;

    @Column(name = "sync_registration_concept_1_usable")
    private Boolean isSyncRegistrationConcept1Usable;

    @Column(name = "sync_registration_concept_2_usable")
    private Boolean isSyncRegistrationConcept2Usable;

    @Column(name = "allow_middle_name")
    private boolean allowMiddleName;

    @Column
    private String programEligibilityCheckRule;

    @Column(name = "program_eligibility_check_declarative_rule")
    @Type(type = "declarativeRule")
    private DeclarativeRule programEligibilityCheckDeclarativeRule;

    private String nameHelpText;

    public Set<GroupRole> getGroupRoles() {
        return groupRoles;
    }

    public void setGroupRoles(Set<GroupRole> groupRoles) {
        this.groupRoles = groupRoles;
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

    public void setGroup(boolean group) {
        isGroup = group;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Set<OperationalSubjectType> getOperationalSubjectTypes() {
        return operationalSubjectTypes;
    }

    @JsonIgnore
    public OperationalSubjectType getOperationalSubjectType() {
        return operationalSubjectTypes.stream().findFirst().orElse(null);
    }

    public void setOperationalSubjectTypes(Set<OperationalSubjectType> operationalSubjectTypes) {
        this.operationalSubjectTypes = operationalSubjectTypes;
    }

    public Subject getType() {
        return type;
    }

    public void setType(Subject type) {
        this.type = type;
    }

    public String getSubjectSummaryRule() {
        return subjectSummaryRule;
    }

    public void setSubjectSummaryRule(String subjectSummaryRule) {
        this.subjectSummaryRule = subjectSummaryRule;
    }

    @JsonIgnore
    public String getOperationalSubjectTypeName() {
        OperationalSubjectType operationalSubjectType = getOperationalSubjectType();
        if (operationalSubjectType == null) return null;
        return operationalSubjectType.getName();
    }

    @JsonIgnore
    public List<GroupRoleContract> getGroupRolesContract() {
        return groupRoles.stream()
                .filter(r -> !r.isVoided())
                .map(GroupRoleContract::fromEntity)
                .collect(Collectors.toList());
    }

    @JsonIgnore
    public List<String> getMemberSubjectUUIDs() {
        return isGroup() ? groupRoles.stream()
                .filter(gr -> !gr.getMemberSubjectType().isVoided())
                .map(gr -> gr.getMemberSubjectType().getUuid()).collect(Collectors.toList()) : Collections.emptyList();
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = Optional.ofNullable(active).orElse(true);
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

    public boolean isAllowMiddleName() {
        return allowMiddleName;
    }

    public void setAllowMiddleName(boolean allowMiddleName) {
        this.allowMiddleName = allowMiddleName;
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
        return validFirstNameFormat;
    }

    public void setValidFirstNameFormat(Format validFirstNameFormat) {
        this.validFirstNameFormat = validFirstNameFormat;
    }

    public Format getValidMiddleNameFormat() {
        return validMiddleNameFormat;
    }

    public void setValidMiddleNameFormat(Format validMiddleNameFormat) {
        this.validMiddleNameFormat = validMiddleNameFormat;
    }

    public Format getValidLastNameFormat() {
        return validLastNameFormat;
    }

    public void setValidLastNameFormat(Format validLastNameFormat) {
        this.validLastNameFormat = validLastNameFormat;
    }

    public String getIconFileS3Key() {
        return iconFileS3Key;
    }

    public void setIconFileS3Key(String iconFileS3Key) {
        this.iconFileS3Key = iconFileS3Key;
    }

    public boolean isPerson() {
        return type.equals(Subject.Person);
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

    public String getProgramEligibilityCheckRule() {
        return programEligibilityCheckRule;
    }

    public void setProgramEligibilityCheckRule(String programEligibilityCheckRule) {
        this.programEligibilityCheckRule = programEligibilityCheckRule;
    }

    public DeclarativeRule getProgramEligibilityCheckDeclarativeRule() {
        return programEligibilityCheckDeclarativeRule;
    }

    public void setProgramEligibilityCheckDeclarativeRule(DeclarativeRule programEligibilityCheckDeclarativeRule) {
        this.programEligibilityCheckDeclarativeRule = programEligibilityCheckDeclarativeRule;
    }

    @Projection(name = "SubjectTypeProjection", types = {SubjectType.class})
    public interface SubjectTypeProjection extends BaseProjection {
        String getName();

        String getOperationalSubjectTypeName();

        boolean isGroup();

        String getMemberSubjectUUIDs();

        String getType();

        boolean isAllowEmptyLocation();

        boolean isAllowProfilePicture();

        String getIconFileS3Key();

        String getNameHelpText();

        boolean isAllowMiddleName();

        Format getValidFirstNameFormat();
        Format getValidMiddleNameFormat();
        Format getValidLastNameFormat();

        List<GroupRole.GroupRoleProjection> getGroupRoles();
    }
}
