package org.openchs.service;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTCreator;
import com.auth0.jwt.algorithms.Algorithm;
import org.junit.Before;
import org.junit.Test;
import org.mockito.Mock;
import org.openchs.dao.OrganisationRepository;
import org.openchs.dao.UserRepository;
import org.openchs.domain.Organisation;
import org.openchs.domain.User;
import org.openchs.domain.UserContext;

import java.io.UnsupportedEncodingException;

import static org.hamcrest.CoreMatchers.equalTo;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.hamcrest.core.Is.is;
import static org.mockito.Mockito.when;
import static org.mockito.MockitoAnnotations.initMocks;

public class CognitoUserContextServiceImplTest {
    @Mock
    private OrganisationRepository organisationRepository;
    @Mock
    private UserRepository userRepository;

    private CognitoUserContextServiceImpl userContextService;
    private User user;

    @Before
    public void setup() {
        initMocks(this);
        userContextService = new CognitoUserContextServiceImpl(organisationRepository, userRepository, "poolId", "clientId");
        String uuid = "9ecc2805-6528-47ee-8267-9368b266ad39";
        user = new User();
        user.setUuid(uuid);
        user.setOrganisationId(1L);
    }

    @Test
    public void shouldReturnEmptyUserContextIfTokenCannotBeDecoded() {
        UserContext userContext = userContextService.getUserContext("invalidToken", null);
        assertThat(userContext.getOrganisation(), is(equalTo(null)));
        assertThat(userContext.getRoles().size(), is(equalTo(0)) );
    }

    @Test
    public void shouldReturnEmptyContextIfNullTokenPassed() {
        UserContext userContext = userContextService.getUserContext(null, null);
        assertThat(userContext.getOrganisation(), is(equalTo(null)));
        assertThat(userContext.getRoles().size(), is(equalTo(0)) );
    }

    @Test
    public void shouldAddOrganisationToContext() throws UnsupportedEncodingException {
        Organisation organisation = new Organisation();
        when(organisationRepository.findOne(1L)).thenReturn(organisation);
        when(userRepository.findByUuid(user.getUuid())).thenReturn(user);
        Algorithm algorithm = Algorithm.HMAC256("not very useful secret");
        String token = createForBaseToken(user.getUuid()).sign(algorithm);
        UserContext userContext = userContextService.getUserContext(token, false);
        assertThat(userContext.getOrganisation(), is(equalTo(organisation)));
    }

    private JWTCreator.Builder createForBaseToken(String userUuid) {
        return JWT.create().withClaim("custom:userUUID", userUuid);
    }

    @Test
    public void shouldAddRolesToContext() throws UnsupportedEncodingException {
        Organisation organisation = new Organisation();
        when(organisationRepository.findOne(1L)).thenReturn(organisation);
        when(userRepository.findByUuid(user.getUuid())).thenReturn(user);
        Algorithm algorithm = Algorithm.HMAC256("not very useful secret");
        String token = createForBaseToken(user.getUuid()).sign(algorithm);

        UserContext userContext = userContextService.getUserContext(token, false);
        assertThat(userContext.getRoles(), contains(User.USER));
        assertThat(userContext.getRoles().size(), is(equalTo(1)));

        token = createForBaseToken(user.getUuid()).sign(algorithm);

        user.setOrgAdmin(true);
        userContext = userContextService.getUserContext(token, false);
        assertThat(userContext.getRoles(), containsInAnyOrder(User.USER, User.ORGANISATION_ADMIN));
        assertThat(userContext.getRoles().size(), is(equalTo(2)));
    }
}
