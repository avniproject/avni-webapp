package org.openchs.domain;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.List;

@Entity
@Table(name = "checklist")
public class Checklist extends CHSEntity {
    @NotNull
    private String name;

    @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true, mappedBy = "checklist")
    private List<ChecklistItem> items;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "program_enrolment_id")
    private ProgramEnrolment programEnrolment;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<ChecklistItem> getItems() {
        return items;
    }

    public void setItems(List<ChecklistItem> items) {
        this.items = items;
    }

    public ProgramEnrolment getProgramEnrolment() {
        return programEnrolment;
    }

    public void setProgramEnrolment(ProgramEnrolment programEnrolment) {
        this.programEnrolment = programEnrolment;
    }
}