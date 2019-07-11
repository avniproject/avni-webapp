package org.openchs.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.openchs.application.projections.BaseProjection;
import org.springframework.data.rest.core.config.Projection;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "subject_type")
@JsonIgnoreProperties({"operationalSubjectTypes"})
public class SubjectType extends OrganisationAwareEntity {
    @NotNull
    @Column
    private String name;

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "subjectType")
    private Set<OperationalSubjectType> operationalSubjectTypes = new HashSet<>();

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Set<OperationalSubjectType> getOperationalSubjectTypes() {
        return operationalSubjectTypes;
    }

    public void setOperationalSubjectTypes(Set<OperationalSubjectType> operationalSubjectTypes) {
        this.operationalSubjectTypes = operationalSubjectTypes;
    }

    @JsonIgnore
    public String getOperationalSubjectTypeName() {
        return operationalSubjectTypes.stream().map(OperationalSubjectType::getName).findFirst().orElse(null);
    }

    @Projection(name = "SubjectTypeProjection", types = {SubjectType.class})
    public interface SubjectTypeProjection extends BaseProjection {
        String getName();

        String getOperationalSubjectTypeName();
    }
}
