package org.openchs.web.request;

import java.io.Serializable;
import java.util.List;

public class CustomPrintRequest {
    private List<CustomPrintProperties> customPrintProperties;

    public List<CustomPrintProperties> getCustomPrintProperties() {
        return customPrintProperties;
    }

    public void setCustomPrintProperties(List<CustomPrintProperties> customPrintProperties) {
        this.customPrintProperties = customPrintProperties;
    }

    static class CustomPrintProperties implements Serializable {
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
}
