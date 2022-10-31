package org.avni.server.util;

import org.jboss.resteasy.client.jaxrs.ResteasyClientBuilder;
import org.junit.Before;
import org.junit.Test;
import org.keycloak.OAuth2Constants;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.keycloak.admin.client.resource.RealmResource;
import org.keycloak.representations.adapters.config.AdapterConfig;
import org.mockito.Mock;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.stream.Collectors;

public class KeycloakConnectivityTest {

    public static final String KEYCLOAK_ADMIN_API_CLIENT_ID = "admin-api";
    private static final Logger logger = LoggerFactory.getLogger(KeycloakConnectivityTest.class);

    private AdapterConfig adapterConfig;
    private Keycloak keycloak;
    private RealmResource realmResource;

    @Before
    public void beforeTest() {
        adapterConfig = new AdapterConfig();
        adapterConfig.setAuthServerUrl("http://localhost:8080");
        adapterConfig.setRealm("On-premise");
        HashMap<String, Object> cred = new HashMap<>();
        cred.put("secret", "FeYJzLnwPZaOs21sezRBDDFmvP0vIQMK");
        adapterConfig.setCredentials(cred);
    }

//    @Test
    public void getListOfUsers() throws Exception {
        keycloak = KeycloakBuilder.builder().serverUrl(adapterConfig.getAuthServerUrl())
                .grantType(OAuth2Constants.CLIENT_CREDENTIALS).realm(adapterConfig.getRealm())
                .clientId(KEYCLOAK_ADMIN_API_CLIENT_ID)
                .clientSecret((String) adapterConfig.getCredentials().get("secret"))
                .resteasyClient(new ResteasyClientBuilder().connectionPoolSize(10).build()).build();
        keycloak.tokenManager().getAccessToken();
        realmResource = keycloak.realm(adapterConfig.getRealm());
        logger.info("Keycloak user: " + realmResource.users().list().stream().map(ur -> ur.getEmail()).collect(Collectors.toList()));
    }
}
