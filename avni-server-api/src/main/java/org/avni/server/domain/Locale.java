package org.avni.server.domain;

import org.springframework.lang.Nullable;

public enum Locale {
    en("English"),
    hi_IN("Hindi"),
    mr_IN("Marathi"),
    gu_IN("Gujarati"),
    be_IN("Bengali"),
    te_IN("Telugu"),
    ta_IN("Tamil"),
    ka_IN("Kannada"),
    od_IN("Odia"),
    ma_IN("Malayalam"),
    pu_IN("Punjabi"),
    sa_IN("Sanskrit"),
    ur_IN("Urdu"),
    as_IN("ASSAMESE");

    private final String name;

    Locale(String name) {
        this.name = name;
    }

    public static Locale valueByName(@Nullable String name) {
        for (Locale value : Locale.values()) {
            if (value.name.equals(name)) return value;
        }
        return null;
    }

    public String getName() {
        return name;
    }
}
