package org.openchs.web.request.rules.response;

public class KeyValueResponse {
    private String name;
    private Object value;

    public String getName() {
        return this.name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Object getValue() {
        return this.value;
    }

    public void setValue(Object value) {
        this.value = value;
    }
}
