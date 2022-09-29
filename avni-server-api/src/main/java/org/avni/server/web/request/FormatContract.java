package org.avni.server.web.request;

import org.avni.server.application.Format;

public class FormatContract extends ReferenceDataContract {

    private String regex;
    private String descriptionKey;

    public FormatContract() {
    }

    public FormatContract(String regex, String descriptionKey) {
        this.regex = regex;
        this.descriptionKey = descriptionKey;
    }

    public String getRegex() {
        return regex;
    }

    public void setRegex(String regex) {
        this.regex = regex;
    }

    public String getDescriptionKey() {
        return descriptionKey;
    }

    public void setDescriptionKey(String descriptionKey) {
        this.descriptionKey = descriptionKey;
    }

    public Format toFormat() {
        return new Format(this.regex, this.descriptionKey);
    }

    public static FormatContract fromFormat(Format format) {
        if (format == null)
            return null;
        return new FormatContract(format.getRegex(), format.getDescriptionKey());
    }
}
