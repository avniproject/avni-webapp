package org.avni.messaging.contract.glific;

import java.util.List;

public class GlificMessageTemplateResponse {
    private List<GlificMessageTemplate> sessionTemplates;

    public List<GlificMessageTemplate> getSessionTemplates() {
        return sessionTemplates;
    }

    public void setSessionTemplates(List<GlificMessageTemplate> sessionTemplates) {
        this.sessionTemplates = sessionTemplates;
    }
}
