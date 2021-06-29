package org.openchs.web.request;

import org.openchs.domain.JsonObject;

import java.io.Serializable;

public class CustomPrintRequest implements Serializable {
    private String label;
    private String fileName;
    private JsonObject printScope;

    public JsonObject getPrintScope() {
        return printScope;
    }

    public void setPrintScope(JsonObject printScope) {
        this.printScope = printScope;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }
}
