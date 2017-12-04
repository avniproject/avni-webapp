package org.openchs.service;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import org.hamcrest.CoreMatchers;
import org.junit.Before;
import org.junit.Test;
import org.mockito.Mock;
import org.openchs.dao.OrganisationRepository;
import org.openchs.domain.Organisation;
import org.openchs.domain.UserContext;

import java.io.UnsupportedEncodingException;

import static org.hamcrest.CoreMatchers.equalTo;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.hamcrest.core.Is.is;
import static org.mockito.Mockito.when;
import static org.mockito.MockitoAnnotations.initMocks;

public class CognitoContextServiceImplTest {

    @Mock
    private OrganisationRepository organisationRepository;


    private CognitoUserContextServiceImpl userContextService;


    @Before
    public void setup() {
        initMocks(this);
        userContextService = new CognitoUserContextServiceImpl(organisationRepository, "publicKey", "clientId");
    }

    @Test
    public void shouldReturnEmptyUserContextIfTokenCannotBeDecoded() {
        UserContext userContext = userContextService.getUserContext("invalidToken");
        assertThat(userContext.getOrganisation(), is(equalTo(null)));
        assertThat(userContext.getRoles().size(), is(equalTo(0)) );
    }

    @Test
    public void shouldReturnEmptyContextIfNullTokenPassed() {
        UserContext userContext = userContextService.getUserContext(null);
        assertThat(userContext.getOrganisation(), is(equalTo(null)));
        assertThat(userContext.getRoles().size(), is(equalTo(0)) );
    }

    @Test
    public void shouldAddOrganisationToContext() throws UnsupportedEncodingException {
        Organisation organisation = new Organisation();
        when(organisationRepository.findOne(1L)).thenReturn(organisation);
        Algorithm algorithm = Algorithm.HMAC256("not very useful secret");
        String token = JWT.create()
                .withClaim("custom:organisationId", "1").sign(algorithm);

        UserContext userContext = userContextService.getUserContext(token, false);
        assertThat(userContext.getOrganisation(), is(equalTo(organisation)));
    }

    @Test
    public void shouldAddRolesToContext() throws UnsupportedEncodingException {
        Organisation organisation = new Organisation();
        when(organisationRepository.findOne(1L)).thenReturn(organisation);
        Algorithm algorithm = Algorithm.HMAC256("not very useful secret");
        String token = JWT.create()
                .withClaim("custom:isUser", "true")
                .withClaim("custom:isOrganisationAdmin", "false")
                .withClaim("custom:organisationId", "1")
                .sign(algorithm);

        UserContext userContext = userContextService.getUserContext(token, false);
        assertThat(userContext.getRoles(), contains(UserContext.USER));
        assertThat(userContext.getRoles().size(), is(equalTo(1)));

        token = JWT.create()
                .withClaim("custom:isUser", "true")
                .withClaim("custom:isOrganisationAdmin", "True")
                .withClaim("custom:organisationId", "1")
                .sign(algorithm);

        userContext = userContextService.getUserContext(token, false);
        assertThat(userContext.getRoles(), containsInAnyOrder(UserContext.USER, UserContext.ORGANISATION_ADMIN));
        assertThat(userContext.getRoles().size(), is(equalTo(2)));
    }
}
