package org.avni.server.web.request.webapp.search;

import java.util.List;

public class Concept {
    private String uuid;
    private String searchScope;
    private String dataType;
    private List<String> values;
    private String widget;
    private String minValue;
    private String maxValue;
    private String value;


    public Concept(String uuid, String searchScope, String dataType, List<String> values, String value) {
        this.uuid = uuid;
        this.searchScope = searchScope;
        this.dataType = dataType;
        this.values = values;
        this.value = value;
    }

    public String getUuid() {
        return trim(uuid);
    }

    public void setUuid(String uuid) {
        this.uuid = uuid;
    }

    public String getSearchScope() {
        return trim(searchScope);
    }

    public void setSearchScope(String searchScope) {
        this.searchScope = searchScope;
    }

    public String getDataType() {
        return trim(dataType);
    }

    public void setDataType(String dataType) {
        this.dataType = dataType;
    }

    public List<String> getValues() {
        return values;
    }

    public void setValues(List<String> values) {
        this.values = values;
    }

    public String getWidget() {
        return widget;
    }

    public void setWidget(String widget) {
        this.widget = widget;
    }

    public String getMinValue() {
        return minValue;
    }

    public void setMinValue(String minValue) {
        this.minValue = minValue;
    }

    public String getMaxValue() {
        return trim(maxValue);
    }

    public void setMaxValue(String maxValue) {
        this.maxValue = maxValue;
    }

    public String getValue() {
        return trim(value);
    }

    public void setValue(String value) {
        this.value = value;
    }

    private String trim(String item) {
        if (item == null) return item;
        return item.trim();
    }
}
