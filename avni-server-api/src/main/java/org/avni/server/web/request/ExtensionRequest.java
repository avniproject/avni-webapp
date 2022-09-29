package org.avni.server.web.request;

import org.avni.server.domain.JsonObject;

import java.io.Serializable;

public class ExtensionRequest implements Serializable {
    private String label;
    private String fileName;
    private JsonObject extensionScope;

    public JsonObject getExtensionScope() {
        return extensionScope;
    }

    public void setExtensionScope(JsonObject extensionScope) {
        this.extensionScope = extensionScope;
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
