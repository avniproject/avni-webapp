package org.openchs.web.request;

import org.openchs.domain.JsonObject;
import org.openchs.domain.Locale;

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
