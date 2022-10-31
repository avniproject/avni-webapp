package org.avni.messaging.contract.glific;

import java.io.Serializable;

public class GlificMessageTemplate implements Serializable {
    private String body;
    private String id;
    private String label;

    public String getBody() {
        return body;
    }

    public void setBody(String body) {
        this.body = body;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }
}
