package org.avni.server.web.external;

import org.avni.server.domain.UserContext;
import org.avni.server.framework.security.AuthenticationFilter;
import org.avni.server.framework.security.UserContextHolder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

@Service
public class RuleServiceClient {
    @Value("${node.server.url}")
    private String NODE_SERVER_HOST;
    private Logger logger = LoggerFactory.getLogger(RuleServiceClient.class);

    public <T> String post(String api, T jsonObj) throws HttpClientErrorException {
        String uri = NODE_SERVER_HOST.concat(api);
        RestTemplate restTemplate = new RestTemplate();
        HttpEntity<Object> entityCredentials = new HttpEntity<>(jsonObj, constructHeaders());
        try {
            return restTemplate.postForObject(uri, entityCredentials, String.class);
        } catch (HttpClientErrorException e) {
            logger.info("rule " + api + " not found");
            throw new HttpClientErrorException(HttpStatus.NOT_FOUND, "rule " + api + " not found");
        }
    }

    private HttpHeaders constructHeaders() {
        HttpHeaders httpHeaders = new HttpHeaders();
        UserContext userContext = UserContextHolder.getUserContext();
        String userName = userContext.getUserName();
        String organisationUUID = userContext.getOrganisation().getUuid();
        String authToken = userContext.getAuthToken();

        httpHeaders.setContentType(MediaType.APPLICATION_JSON);
        if(userName != null)
            httpHeaders.add(AuthenticationFilter.USER_NAME_HEADER, userName);
        if(organisationUUID != null)
            httpHeaders.add(AuthenticationFilter.ORGANISATION_UUID, organisationUUID);
        if(authToken != null)
            httpHeaders.add(AuthenticationFilter.AUTH_TOKEN_HEADER, authToken);
        return httpHeaders;
    }
}
