package org.openchs.application;

import org.hibernate.annotations.Type;
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

    @Column(name = "related_entity")
    @Type(type = "keyValues")
    private KeyValues keyValues;

    public Form getForm() {
        return form;
    }

    public void setForm(Form form) {
        this.form = form;
    }

    public KeyValues getKeyValues() {
        return keyValues;
    }

    public void setKeyValues(KeyValues keyValues) {
        this.keyValues = keyValues;
    }
}