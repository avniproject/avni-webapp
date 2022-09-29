package org.avni.server.domain;

import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.Type;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

@Entity
@Table(name = "translation")
@BatchSize(size = 100)
public class Translation extends OrganisationAwareEntity {
    @Column
    @Type(type = "jsonObject")
    private JsonObject translationJson;


    @NotNull
    @Column
    @Enumerated(EnumType.STRING)
    private Locale language;

    public Locale getLanguage() {
        return language;
    }

    public void setLanguage(Locale language) {
        this.language = language;
    }

    public JsonObject getTranslationJson() {
        return translationJson;
    }

    public void setTranslationJson(JsonObject translationJson) {
        this.translationJson = translationJson;
    }

}
