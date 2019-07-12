package org.openchs.application;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.openchs.application.projections.BaseProjection;
import org.openchs.domain.OrganisationAwareEntity;
import org.openchs.domain.SubjectType;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.rest.core.config.Projection;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

@Entity
@Table(name = "form_mapping")
@JsonIgnoreProperties({"form", "programId", "encounterTypeId", "subjectType"})
public class FormMapping extends OrganisationAwareEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @NotNull
    @JoinColumn(name = "form_id")
    private Form form;

    @Column(name = "entity_id")
    private Long programId;

    @Column(name = "observations_type_entity_id")
    private Long encounterTypeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_type_id")
    private SubjectType subjectType;

    public Form getForm() {
        return form;
    }

    public void setForm(Form form) {
        this.form = form;
    }

    public Long getProgramId() {
        return programId;
    }

    public void setProgramId(Long programId) {
        this.programId = programId;
    }

    public Long getEncounterTypeId() {
        return encounterTypeId;
    }

    public void setEncounterTypeId(Long encounterTypeId) {
        this.encounterTypeId = encounterTypeId;
    }

    public SubjectType getSubjectType() {
        return subjectType;
    }

    public void setSubjectType(SubjectType subjectType) {
        this.subjectType = subjectType;
    }

    @Projection(name = "FormMappingProjection", types = {FormMapping.class})
    public interface FormMappingProjection extends BaseProjection {
        @Value("#{target.subjectType.id}")
        Long getSubjectTypeId();

        @Value("#{target.form.id}")
        Long getFormId();

        Long getEncounterTypeId();

        Long getProgramId();
    }
}