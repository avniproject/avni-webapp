package org.openchs.domain;

import org.joda.time.LocalDate;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

@Entity
@Table(name = "checklist_item")
public class ChecklistItem extends CHSEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @NotNull
    @JoinColumn(name = "concept_id")
    private Concept concept;

    @Column
    private LocalDate dueDate;
    @Column
    private LocalDate maxDate;
    @Column
    private LocalDate completionDate;

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

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public LocalDate getMaxDate() {
        return maxDate;
    }

    public void setMaxDate(LocalDate maxDate) {
        this.maxDate = maxDate;
    }

    public LocalDate getCompletionDate() {
        return completionDate;
    }

    public void setCompletionDate(LocalDate completionDate) {
        this.completionDate = completionDate;
    }

    public Checklist getChecklist() {
        return checklist;
    }

    public void setChecklist(Checklist checklist) {
        this.checklist = checklist;
    }
}