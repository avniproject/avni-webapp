package org.openchs.domain;

import org.hibernate.annotations.Type;
import org.joda.time.DateTime;
import org.joda.time.LocalDate;
import org.openchs.domain.programConfig.VisitScheduleConfig;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

@Entity
@Table(name = "checklist_item")
public class ChecklistItem extends OrganisationAwareEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @NotNull
    @JoinColumn(name = "concept_id")
    private Concept concept;

    @Column(name = "status")
    @Type(type = "status")
    private ChecklistItemStatus checklistItemStatus;

    @Column
    private DateTime completionDate;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "checklist_id")
    private Checklist checklist;

    public Concept getConcept() {
        return concept;
    }

    public void setConcept(Concept concept) {
        this.concept = concept;
    }

    public DateTime getCompletionDate() {
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

    public ChecklistItemStatus getChecklistItemStatus() {
        return checklistItemStatus;
    }

    public void setChecklistItemStatus(ChecklistItemStatus checklistItemStatus) {
        this.checklistItemStatus = checklistItemStatus;
    }
}