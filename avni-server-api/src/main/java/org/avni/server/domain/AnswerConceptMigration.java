package org.avni.server.domain;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.hibernate.annotations.BatchSize;

import javax.persistence.*;

@Entity
@Table(name = "answer_concept_migration")
@JsonIgnoreProperties({"concept"})
@BatchSize(size = 100)
public class AnswerConceptMigration extends OrganisationAwareEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "concept_id")
    private Concept concept;

    @Column(name = "old_answer_concept_name")
    private String oldAnswerConceptName;

    @Column(name = "new_answer_concept_name")
    private String newAnswerConceptName;

    public Concept getConcept() {
        return concept;
    }

    public void setConcept(Concept concept) {
        this.concept = concept;
    }

    public String getOldAnswerConceptName() {
        return oldAnswerConceptName;
    }

    public void setOldAnswerConceptName(String oldAnswerConceptName) {
        this.oldAnswerConceptName = oldAnswerConceptName;
    }

    public String getNewAnswerConceptName() {
        return newAnswerConceptName;
    }

    public void setNewAnswerConceptName(String newAnswerConceptName) {
        this.newAnswerConceptName = newAnswerConceptName;
    }
}


