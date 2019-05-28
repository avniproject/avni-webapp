package org.openchs.application;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.openchs.domain.CHSEntity;
import org.openchs.domain.OrganisationAwareEntity;
import org.openchs.domain.SubjectType;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

@Entity
@Table(name = "form_mapping")
public class FormMapping extends OrganisationAwareEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @NotNull
    @JoinColumn(name = "form_id")
    private Form form;

    //program id
    @Column(name = "entity_id")
    private Long entityId;

    //encounter type id
    @Column(name = "observations_type_entity_id")
    private Long observationsTypeEntityId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_type_id")
    private SubjectType subjectType;

    public Form getForm() {
        return form;
    }

    public void setForm(Form form) {
        this.form = form;
    }

    @JsonIgnore
    public Long getEntityId() {
        return entityId;
    }

    public void setEntityId(Long entityId) {
        this.entityId = entityId;
    }

    @JsonIgnore
    public Long getObservationsTypeEntityId() {
        return observationsTypeEntityId;
    }

    public void setObservationsTypeEntityId(Long observationsTypeEntityId) {
        this.observationsTypeEntityId = observationsTypeEntityId;
    }

    @JsonIgnore
    public SubjectType getSubjectType() {
        return subjectType;
    }

    public void setSubjectType(SubjectType subjectType) {
        this.subjectType = subjectType;
    }
}