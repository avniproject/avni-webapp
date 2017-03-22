package org.openchs.application;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.openchs.domain.CHSEntity;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

@Entity
@Table(name = "form_mapping")
public class FormMapping extends CHSEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @NotNull
    @JoinColumn(name = "form_id")
    private Form form;

    @Column(name = "entity_id")
    private Long entityId;

    @Column(name = "observations_type_entity_id")
    private Long observationsTypeEntityId;

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
}