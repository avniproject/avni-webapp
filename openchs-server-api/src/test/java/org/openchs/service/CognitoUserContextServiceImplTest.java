package org.openchs.service;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTCreator;
import com.auth0.jwt.algorithms.Algorithm;
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

public class CognitoUserContextServiceImplTest {

    @Mock
    private OrganisationRepository organisationRepository;


    private CognitoUserContextServiceImpl userContextService;


    @Before
    public void setup() {
        initMocks(this);
        userContextService = new CognitoUserContextServiceImpl(organisationRepository, "poolId", "clientId");
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
        Algorithm algorithm = Algorithm.HMAC256("not very useful secret");
        String token = createForBaseToken().sign(algorithm);
        UserContext userContext = userContextService.getUserContext(token, false, null);
        assertThat(userContext.getOrganisation(), is(equalTo(organisation)));
    }

    private JWTCreator.Builder createForBaseToken() {
        return JWT.create();
    }

    @Test
    public void shouldAddRolesToContext() throws UnsupportedEncodingException {
        Organisation organisation = new Organisation();
        when(organisationRepository.findOne(1L)).thenReturn(organisation);
        Algorithm algorithm = Algorithm.HMAC256("not very useful secret");
        String token = createForBaseToken().sign(algorithm);

        UserContext userContext = userContextService.getUserContext(token, false, null);
        assertThat(userContext.getRoles(), contains(UserContext.USER));
        assertThat(userContext.getRoles().size(), is(equalTo(1)));

        token = createForBaseToken().sign(algorithm);

        userContext = userContextService.getUserContext(token, false, null);
        assertThat(userContext.getRoles(), containsInAnyOrder(UserContext.USER, UserContext.ORGANISATION_ADMIN));
        assertThat(userContext.getRoles().size(), is(equalTo(2)));
    }

    @Test
    public void shouldBeAbleToSwitchOrganisationIfAdmin() throws UnsupportedEncodingException {
        Organisation anOrg = new Organisation();
        Organisation becomeOrg = new Organisation();
        becomeOrg.setName("BecomeOrg");
        when(organisationRepository.findOne(1L)).thenReturn(anOrg);
        when(organisationRepository.findByName(becomeOrg.getName())).thenReturn(becomeOrg);
        Algorithm algorithm = Algorithm.HMAC256("not very useful secret");
        String token = createForBaseToken().sign(algorithm);

        UserContext userContext = userContextService.getUserContext(token, false, becomeOrg.getName());
        assertThat(userContext.getOrganisation(), is(equalTo(becomeOrg)));

        userContext = userContextService.getUserContext(token, false, null);
        assertThat(userContext.getOrganisation(), is(equalTo(anOrg)));

    }

}
