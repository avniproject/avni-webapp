package org.avni.server.application;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.avni.server.application.projections.BaseProjection;
import org.avni.server.domain.EncounterType;
import org.avni.server.domain.OrganisationAwareEntity;
import org.avni.server.domain.Program;
import org.avni.server.domain.SubjectType;
import org.avni.server.domain.task.TaskType;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.rest.core.config.Projection;

import javax.persistence.*;

@Entity
@Table(name = "form_mapping")
@JsonIgnoreProperties({"form", "program", "encounterType", "subjectType"})
public class FormMapping extends OrganisationAwareEntity {
    @ManyToOne(fetch = FetchType.LAZY)
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_type_id")
    private TaskType taskType;

    private boolean enableApproval;

    public Form getForm() {
        return form;
    }

    public void setForm(Form form) {
        this.form = form;
    }

    public String getFormUuid() {
        return this.getForm() != null ? this.getForm().getUuid() : null;
    }

    public FormType getType() {
        return this.getForm() != null ? this.getForm().getFormType() : null;
    }

    public String getFormName() {
        return this.getForm() != null ? this.getForm().getName() : null;
    }

    public Program getProgram() {
        return program;
    }

    public String getProgramUuid() {
        return this.getProgram() != null ? this.getProgram().getUuid() : null;
    }

    public String getEncounterTypeUuid() {
        return this.getEncounterType() != null ? this.getEncounterType().getUuid() : null;
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

    public String getSubjectTypeUuid() {
        return this.getSubjectType() != null ? this.getSubjectType().getUuid() : null;
    }

    public void setSubjectType(SubjectType subjectType) {
        this.subjectType = subjectType;
    }

    public boolean isEnableApproval() {
        return enableApproval;
    }

    public void setEnableApproval(boolean enableApproval) {
        this.enableApproval = enableApproval;
    }

    public TaskType getTaskType() {
        return taskType;
    }

    public void setTaskType(TaskType taskType) {
        this.taskType = taskType;
    }

    @Override
    public String toString() {
        StringBuilder stringBuilder = new StringBuilder();
        stringBuilder.append("Form=").append(getForm().getName());
        if (subjectType != null)
            stringBuilder.append(", subjectType=").append(getSubjectType().getName());
        stringBuilder.append(", program=").append(getProgram() == null ? "null" : getProgram().getName());
        stringBuilder.append(", encounterType=").append(getEncounterType() == null ? "null" : getEncounterType().getName());
        return stringBuilder.toString();
    }

    public String getTaskTypeUuid() {
        return taskType == null ? null : taskType.getUuid();
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
