package org.avni.web.request;

import org.avni.domain.JsonObject;
import org.avni.domain.Locale;

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
