package org.openchs.application;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.openchs.application.projections.BaseProjection;
import org.openchs.domain.EncounterType;
import org.openchs.domain.OrganisationAwareEntity;
import org.openchs.domain.Program;
import org.openchs.domain.SubjectType;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.rest.core.config.Projection;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

@Entity
@Table(name = "form_mapping")
@JsonIgnoreProperties({"form", "program", "encounterType", "subjectType"})
public class FormMapping extends OrganisationAwareEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @NotNull
    @JoinColumn(name = "form_id")
    private Form form;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "entity_id")
    private Program program;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "observations_type_entity_id")
    private EncounterType encounterType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_type_id")
    private SubjectType subjectType;

    public Form getForm() {
        return form;
    }

    public void setForm(Form form) {
        this.form = form;
    }

    public Program getProgram() {
        return program;
    }

    public String getProgramUuid() {
        return this.getProgram() != null? this.getProgram().getUuid(): null;
    }

    public String getEncounterTypeUuid() {
        return this.getEncounterType() != null? this.getEncounterType().getUuid(): null;
    }

    public void setProgram(Program program) {
        this.program = program;
    }

    public EncounterType getEncounterType() {
        return encounterType;
    }

    public void setEncounterType(EncounterType encounterType) {
        this.encounterType = encounterType;
    }

    public SubjectType getSubjectType() {
        return subjectType;
    }

    public void setSubjectType(SubjectType subjectType) {
        this.subjectType = subjectType;
    }

    @Projection(name = "FormMappingProjection", types = {FormMapping.class})
    public interface FormMappingProjection extends BaseProjection {
        @Value("#{target.subjectType.uuid}")
        String getSubjectTypeUuid();

        @Value("#{target.form.uuid}")
        String getFormUuid();

        String getEncounterTypeUuid();

        String getProgramUuid();
    }
}