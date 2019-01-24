package org.openchs.domain;

import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.Type;
import org.openchs.application.Form;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

@Entity
@Table(name = "checklist_item_detail")
@BatchSize(size = 100)
public class ChecklistItemDetail extends OrganisationAwareEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @NotNull
    @JoinColumn(name = "concept_id")
    private Concept concept;

    @Column(name = "status")
    @Type(type = "status")
    private ChecklistItemStatus checklistItemStatus;

    @JoinColumn(name = "dependent_on", nullable = true)
    @ManyToOne(fetch = FetchType.LAZY)
    private ChecklistItemDetail leadChecklistItemDetail;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "form_id")
    private Form form;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "checklist_detail_id")
    private ChecklistDetail checklistDetail;

    @Column
    private boolean scheduleOnExpiryOfDependency;

    public Concept getConcept() {
        return concept;
    }

    public void setConcept(Concept concept) {
        this.concept = concept;
    }

    public ChecklistItemStatus getChecklistItemStatus() {
        return checklistItemStatus;
    }

    public void setChecklistItemStatus(ChecklistItemStatus checklistItemStatus) {
        this.checklistItemStatus = checklistItemStatus;
    }

    public Form getForm() {
        return form;
    }

    public void setForm(Form form) {
        this.form = form;
    }

    public ChecklistDetail getChecklistDetail() {
        return checklistDetail;
    }

    public void setChecklistDetail(ChecklistDetail checklistDetail) {
        this.checklistDetail = checklistDetail;
    }

    public ChecklistItemDetail getLeadChecklistItemDetail() {
        return leadChecklistItemDetail;
    }

    public void setLeadChecklistItemDetail(ChecklistItemDetail leadChecklistItemDetail) {
        this.leadChecklistItemDetail = leadChecklistItemDetail;
    }

    public boolean getScheduleOnExpiryOfDependency() {
        return scheduleOnExpiryOfDependency;
    }

    public void setScheduleOnExpiryOfDependency(boolean scheduleOnExpiryOfDependency) {
        this.scheduleOnExpiryOfDependency = scheduleOnExpiryOfDependency;
    }
}
