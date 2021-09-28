package org.avni.web;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AuthDetailsController {

    @Value("${cognito.poolid}")
    private String poolId;

    @Value("${cognito.clientid}")
    private String clientId;

    @RequestMapping(value = "/cognito-details", method = RequestMethod.GET)
    public AuthDetails getAuthDetails() {
        return new AuthDetails(poolId, clientId);
    }

    public class AuthDetails {
        private String poolId;
        private String clientId;

        public AuthDetails(String poolId, String clientId) {
            this.poolId = poolId;
            this.clientId = clientId;
        }

        public String getPoolId() {
            return poolId;
        }

        public String getClientId() {
            return clientId;
        }
    }
}
