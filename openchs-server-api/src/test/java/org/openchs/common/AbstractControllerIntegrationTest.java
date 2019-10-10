package org.openchs.common;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.After;
import org.junit.Before;
import org.junit.runner.RunWith;
import org.openchs.dao.OrganisationRepository;
import org.openchs.dao.UserRepository;
import org.openchs.domain.User;
import org.openchs.domain.UserContext;
import org.openchs.framework.security.UserContextHolder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.web.server.LocalServerPort;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.net.URL;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.UUID;
import java.util.stream.Stream;

import static java.util.Collections.singletonList;
import static org.junit.Assert.assertTrue;
import static org.openchs.framework.security.AuthenticationFilter.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@RunWith(SpringRunner.class)
public abstract class AbstractControllerIntegrationTest {
    @LocalServerPort
    private int port;
    protected URL base;

    @Autowired
    public TestRestTemplate template;

    @Autowired
    private WebApplicationContext webApplicationContext;

    protected MockMvc mockMvc;

    @Autowired
    public UserRepository userRepository;

    @Autowired
    public OrganisationRepository organisationRepository;

    protected static ObjectMapper mapper = new ObjectMapper();

    @Before
    public void setUp() throws Exception {
        this.base = new URL("http://localhost:" + port + "/");
        UserContextHolder.clear();
        template.getRestTemplate().setInterceptors(new ArrayList<>());
        this.mockMvc = MockMvcBuilders.webAppContextSetup(this.webApplicationContext).build();
        setRoles();
    }

    @After
    public void teardown() throws Exception {
        UserContextHolder.clear();
        template.getRestTemplate().setInterceptors(new ArrayList<>());
        setRoles();
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

    protected void setUser(String name) {
        setUserNameHeader(name);

        setRoles(ADMIN_AUTHORITY);

        User user = userRepository.findByUsername(name);
        UserContext userContext = new UserContext();
        userContext.setOrganisation(organisationRepository.findOne(user.getOrganisationId()));
        userContext.setUser(user);
        UserContextHolder.create(userContext);
        SimpleGrantedAuthority[] authorities = Stream.of(USER_AUTHORITY, ADMIN_AUTHORITY, ORGANISATION_ADMIN_AUTHORITY)
                .filter(authority -> userContext.getRoles().contains(authority.getAuthority()))
                .toArray(SimpleGrantedAuthority[]::new);

        setRoles(authorities);
    }

    private void setUserNameHeader(String userName) {
        template.getRestTemplate().setInterceptors(singletonList((request, body, execution) -> {
            request.getHeaders().add(USER_NAME_HEADER, userName);
            return execution.execute(request, body);
        }));
    }

    protected void setRoles(SimpleGrantedAuthority... authorities) {
        if (authorities.length > 0) {
            String token = UUID.randomUUID().toString();
            AnonymousAuthenticationToken auth = new AnonymousAuthenticationToken(token, token, Arrays.asList(authorities));
            auth.setAuthenticated(true);
            SecurityContextHolder.getContext().setAuthentication(auth);
        } else {
            SecurityContextHolder.getContext().setAuthentication(null);
        }
    }
}