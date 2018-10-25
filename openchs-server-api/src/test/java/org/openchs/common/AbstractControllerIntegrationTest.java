package org.openchs.common;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.Before;
import org.junit.runner.RunWith;
import org.openchs.dao.OrganisationRepository;
import org.openchs.framework.security.AuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.embedded.LocalServerPort;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.junit4.SpringRunner;

import java.net.URL;
import java.util.Arrays;
import java.util.Collections;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.Assert.assertTrue;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@RunWith(SpringRunner.class)
public abstract class AbstractControllerIntegrationTest {
    @LocalServerPort
    private int port;
    protected URL base;

    @Autowired
    public TestRestTemplate template;

    @Autowired
    public OrganisationRepository organisationRepository;

    protected static ObjectMapper mapper = new ObjectMapper();

    @Before
    public void setUp() throws Exception {
        template.getRestTemplate().setInterceptors(
                Collections.singletonList((request, body, execution) -> {
                    request.getHeaders()
                            .add(AuthenticationFilter.USER_NAME_HEADER, "admin");
                    return execution.execute(request, body);
                }));

        this.base = new URL("http://localhost:" + port + "/");
        String token = UUID.randomUUID().toString();
        AnonymousAuthenticationToken auth = new AnonymousAuthenticationToken(token, token, Arrays.asList(AuthenticationFilter.ADMIN_AUTHORITY, AuthenticationFilter.USER_AUTHORITY));
        auth.setAuthenticated(true);
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    protected void post(String path, Object json) {
        ResponseEntity<String> responseEntity = template.postForEntity(path, json, String.class);
        String body = String.valueOf(responseEntity.getBody());
        assertTrue(body, responseEntity.getStatusCode().is2xxSuccessful());
    }

    protected String postForBody(String path, Object json) {
        ResponseEntity<String> responseEntity = template.postForEntity(path, json, String.class);
        return String.valueOf(responseEntity.getBody());
    }
}