package org.avni.messaging.contract;

import org.avni.messaging.contract.glific.GlificMessageTemplate;
import org.springframework.beans.BeanUtils;

public class MessageTemplateContract {
    private String body;
    private String id;
    private String label;

    public MessageTemplateContract(GlificMessageTemplate glificMessageTemplate) {
        BeanUtils.copyProperties(glificMessageTemplate, this);
    }

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
