package org.avni.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.avni.application.projections.BaseProjection;
import org.hibernate.annotations.BatchSize;
import org.springframework.data.rest.core.config.Projection;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

@Entity
@Table(name = "group_role")
@JsonIgnoreProperties({"groupSubjectType", "memberSubjectType"})
@BatchSize(size = 100)
public class GroupRole extends OrganisationAwareEntity {

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_subject_type_id")
    private SubjectType groupSubjectType;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_subject_type_id")
    private SubjectType memberSubjectType;

    @Column
    private String role;

    @Column
    private boolean isPrimary;

    @Column
    private Long maximumNumberOfMembers;

    @Column
    private Long minimumNumberOfMembers;

    public SubjectType getGroupSubjectType() {
        return groupSubjectType;
    }

    public void setGroupSubjectType(SubjectType groupSubjectType) {
        this.groupSubjectType = groupSubjectType;
    }

    public SubjectType getMemberSubjectType() {
        return memberSubjectType;
    }

    public void setMemberSubjectType(SubjectType memberSubjectType) {
        this.memberSubjectType = memberSubjectType;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public boolean isPrimary() {
        return isPrimary;
    }

    public void setPrimary(boolean primary) {
        isPrimary = primary;
    }

    public Long getMaximumNumberOfMembers() {
        return maximumNumberOfMembers;
    }

    public void setMaximumNumberOfMembers(Long maximumNumberOfMembers) {
        this.maximumNumberOfMembers = maximumNumberOfMembers;
    }

    public Long getMinimumNumberOfMembers() {
        return minimumNumberOfMembers;
    }

    public void setMinimumNumberOfMembers(Long minimumNumberOfMembers) {
        this.minimumNumberOfMembers = minimumNumberOfMembers;
    }

    public String getGroupSubjectTypeUUID() {
        return groupSubjectType.getUuid();
    }

    public String getMemberSubjectTypeUUID() {
        return memberSubjectType.getUuid();
    }

    @Projection(name = "GroupRoleProjection", types = {GroupRole.class})
    public interface GroupRoleProjection extends BaseProjection {
        String getRole();
    }
}
