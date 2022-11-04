package org.avni.messaging.contract.glific;

public class GlificOptinContactResponse {
    private GlificOptinContactWithErrorsResponse optinContact;

    public GlificOptinContactWithErrorsResponse getOptinContact() {
        return optinContact;
    }

    public void setOptinContact(GlificOptinContactWithErrorsResponse optinContact) {
        this.optinContact = optinContact;
    }
}
