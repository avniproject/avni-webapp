package org.openchs.common;

import org.junit.Before;
import org.junit.runner.RunWith;
import org.openchs.dao.OrganisationRepository;
import org.openchs.framework.security.AuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.embedded.LocalServerPort;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.junit4.SpringRunner;

import java.net.URL;
import java.util.Arrays;
import java.util.Collections;
import java.util.UUID;

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

    @Before
    public void setUp() throws Exception {
        template.getRestTemplate().setInterceptors(
                Collections.singletonList((request, body, execution) -> {
                    request.getHeaders()
                            .add(AuthenticationFilter.ORGANISATION_NAME_HEADER, "OpenCHS");
                    return execution.execute(request, body);
                }));

        this.base = new URL("http://localhost:" + port + "/");
        String token = UUID.randomUUID().toString();
        AnonymousAuthenticationToken auth = new AnonymousAuthenticationToken(token, token, Arrays.asList(AuthenticationFilter.ADMIN_AUTHORITY, AuthenticationFilter.USER_AUTHORITY));
        auth.setAuthenticated(true);
        SecurityContextHolder.getContext().setAuthentication(auth);
    }
}