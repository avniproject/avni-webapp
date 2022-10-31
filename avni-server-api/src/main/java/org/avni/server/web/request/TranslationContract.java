package org.avni.server.web.request;

import org.avni.server.domain.JsonObject;
import org.avni.server.domain.Locale;

public class TranslationContract {
    private JsonObject translationJson;
    private Locale language;

    public JsonObject getTranslationJson() {
        return translationJson;
    }

    public void setTranslationJson(JsonObject translationJson) {
        this.translationJson = translationJson;
    }

    public Locale getLanguage() {
        return language;
    }

    public void setLanguage(Locale language) {
        this.language = language;
    }
}
