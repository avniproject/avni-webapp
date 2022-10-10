package org.avni.messaging.contract.glific;

import com.fasterxml.jackson.annotation.JsonProperty;

public class GlificAuth {
    @JsonProperty("access_token")
    private String accessToken;

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }
}
