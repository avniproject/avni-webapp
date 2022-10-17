package org.avni.messaging.contract.glific;

public class GlificAuthRequest {
    private final GlificUser user;

    public GlificAuthRequest(GlificUser user) {
        this.user = user;
    }

    public GlificUser getUser() {
        return user;
    }
}
