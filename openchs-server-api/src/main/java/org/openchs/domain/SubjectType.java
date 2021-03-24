package org.openchs.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.DynamicInsert;
import org.openchs.application.Subject;
import org.openchs.application.projections.BaseProjection;
import org.openchs.web.request.GroupRoleContract;
import org.springframework.data.rest.core.config.Projection;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.*;
import java.util.stream.Collectors;

@Entity
@Table(name = "subject_type")
@JsonIgnoreProperties({"operationalSubjectTypes"})
@DynamicInsert
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
        return groupRoles.stream().map(GroupRoleContract::fromEntity).collect(Collectors.toList());
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

    public boolean isUniqueName() {
        return uniqueName;
    }

    public void setUniqueName(boolean uniqueName) {
        this.uniqueName = uniqueName;
    }

    @Projection(name = "SubjectTypeProjection", types = {SubjectType.class})
    public interface SubjectTypeProjection extends BaseProjection {
        String getName();

        String getOperationalSubjectTypeName();

        boolean isGroup();

        String getMemberSubjectUUIDs();

        String getType();

        boolean isAllowEmptyLocation();
    }
}
