package org.openchs.domain;

import org.hibernate.annotations.Type;
import org.joda.time.DateTime;
import org.joda.time.LocalDate;
import org.openchs.application.Form;
import org.openchs.domain.programConfig.VisitScheduleConfig;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

@Entity
@Table(name = "checklist_item")
public class ChecklistItem extends OrganisationAwareEntity {
    @Column
    private DateTime completionDate;

    @Column
    @Type(type = "observations")
    private ObservationCollection observations;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "checklist_item_detail_id")
    private ChecklistItemDetail checklistItemDetail;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "checklist_id")
    private Checklist checklist;

    public DateTime getCompletion3Date() {
        return completionDate;
    }

    public void setCompletionDate(DateTime completionDate) {
        this.completionDate = completionDate;
    }

    public Checklist getChecklist() {
        return checklist;
    }

    public void setChecklist(Checklist checklist) {
        this.checklist = checklist;
    }


    public ObservationCollection getObservations() {
        return observations;
    }

    public void setObservations(ObservationCollection observations) {
        this.observations = observations;
    }

    public ChecklistItemDetail getChecklistItemDetail() {
        return checklistItemDetail;
    }

    public void setChecklistItemDetail(ChecklistItemDetail checklistItemDetail) {
        this.checklistItemDetail = checklistItemDetail;
    }
}