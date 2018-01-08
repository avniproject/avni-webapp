package org.openchs.excel;

import org.openchs.application.FormType;

import java.util.HashMap;
import java.util.Map;

public class ExcelFieldMetaData {
    private String form;
    private FormType type;
    private Boolean isCore;
    private String systemField;

    private Map<String, String> map = new HashMap<>();

    public String getForm() {
        return form;
    }

    public void setForm(String form) {
        this.form = form;
    }

    public FormType getType() {
        return type;
    }

    public void setType(FormType type) {
        this.type = type;
    }

    public boolean isCore() {
        return isCore;
    }

    public void setCore(Boolean core) {
        isCore = core;
    }

    public String getSystemField() {
        return systemField;
    }

    public void setSystemField(String systemField) {
        this.systemField = systemField;
    }

    public void addMappingFor(String file, String name) {
        map.put(file, name);
    }

    public String getFieldNameIn(String file) {
        return map.get(file);
    }
}