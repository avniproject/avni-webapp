package org.avni.server.web.request;

import org.avni.server.domain.JsonObject;

public class TranslationRequest {

    private JsonObject translations;
    private String language;
    private String platform;

    public String getPlatform() {
        return platform;
    }

    public void setPlatform(String platform) {
        this.platform = platform;
    }

    public JsonObject getTranslations() {
        return translations;
    }

    public void setTranslations(JsonObject translations) {
        this.translations = translations;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }
}
