package org.openchs.web.request;

import java.io.Serializable;

public class CustomPrintRequest implements Serializable {
    private String label;
    private String fileName;

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
