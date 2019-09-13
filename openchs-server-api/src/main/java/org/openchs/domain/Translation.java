package org.openchs.domain;

import org.hibernate.annotations.Type;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;

@Entity
@Table(name = "translation")
public class Translation extends OrganisationAwareEntity {
    @Column
    @Type(type = "jsonObject")
    private JsonObject translationJson;

    public JsonObject getTranslationJson() {
        return translationJson;
    }

    public void setTranslationJson(JsonObject translationJson) {
        this.translationJson = translationJson;
    }

}
