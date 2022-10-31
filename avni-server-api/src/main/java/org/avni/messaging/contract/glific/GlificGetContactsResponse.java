package org.avni.messaging.contract.glific;

import java.util.List;

public class GlificGetContactsResponse {
    private List<GlificContactResponse> contacts;

    public List<GlificContactResponse> getContacts() {
        return contacts;
    }

    public void setContacts(List<GlificContactResponse> contacts) {
        this.contacts = contacts;
    }
}
