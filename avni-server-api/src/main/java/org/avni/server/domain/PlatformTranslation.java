package org.avni.server.domain;

import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.Type;
import org.avni.server.application.Platform;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

@Entity
@Table(name = "platform_translation")
@BatchSize(size = 100)
public class PlatformTranslation extends CHSEntity {

    @Column
    @Type(type = "jsonObject")
    private JsonObject translationJson;

    @NotNull
    @Column
    @Enumerated(EnumType.STRING)
    private Platform platform;

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

    public Platform getPlatform() {
        return platform;
    }

    public void setPlatform(Platform platform) {
        this.platform = platform;
    }

    public JsonObject getTranslationJson() {
        return translationJson;
    }

    public void setTranslationJson(JsonObject translationJson) {
        this.translationJson = translationJson;
    }

}
