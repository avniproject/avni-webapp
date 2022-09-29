package org.avni.server.web;

import org.springframework.beans.factory.annotation.Autowired;
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

    @Autowired
    private CompositeIDPDetails compositeIDPDetails;

    @RequestMapping(value = "/cognito-details", method = RequestMethod.GET)
    public AuthDetails getAuthDetails() {
        return new AuthDetails(poolId, clientId);
    }

    @RequestMapping(value = "/idp-details", method = RequestMethod.GET)
    public CompositeIDPDetails getCompositeIDPDetails() {
        return compositeIDPDetails;
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

    public static class CompositeIDPDetails {
        private Keycloak keycloak;
        private Cognito cognito;
        public CompositeIDPDetails(String authServerUrl, String keycloakClientId, String grantType, String scope,
                                   String poolId, String clientId) {
            if(authServerUrl != null && keycloakClientId != null) {
                this.keycloak = new Keycloak(authServerUrl, keycloakClientId, grantType, scope);
            }
            if( poolId != null && clientId != null) {
                this.cognito = new Cognito(poolId, clientId);
            }
        }
        public Keycloak getKeycloak() {
            return keycloak;
        }
        public Cognito getCognito() {
            return cognito;
        }
        public class Keycloak {
            private String authServerUrl;
            private String clientId;
            private String grantType;
            private String scope;
            public Keycloak(String authServerUrl, String clientId, String grantType, String scope) {
                this.authServerUrl = authServerUrl;
                this.clientId = clientId;
                this.grantType = grantType;
                this.scope = scope;
            }
            public String getAuthServerUrl() {
                return authServerUrl;
            }
            public String getClientId() {
                return clientId;
            }
            public String getGrantType() {
                return grantType;
            }
            public String getScope() {
                return scope;
            }
        }
        public class Cognito {
            private String poolId;
            private String clientId;
            public Cognito(String poolId, String clientId) {
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
}