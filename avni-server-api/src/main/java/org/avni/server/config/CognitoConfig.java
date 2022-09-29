package org.avni.server.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class CognitoConfig {
    @Value("${cognito.poolid}")
    private String poolId;

    @Value("${cognito.clientid}")
    private String clientId;

    public String getPoolId() {
        return poolId;
    }

    public String getClientId() {
        return clientId;
    }
}
