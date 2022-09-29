package org.avni.service;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTCreator;
import org.avni.server.service.CognitoAuthServiceImpl;
import org.junit.Before;
import org.junit.Test;
import org.mockito.Mock;
import org.avni.server.dao.AccountAdminRepository;
import org.avni.server.dao.OrganisationRepository;
import org.avni.server.dao.UserRepository;
import org.avni.server.domain.Organisation;
import org.avni.server.domain.User;
import org.avni.server.domain.UserContext;
import org.avni.server.domain.AccountAdmin;
import org.avni.server.framework.security.AuthService;

import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.hamcrest.CoreMatchers.equalTo;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.hamcrest.core.Is.is;
import static org.mockito.Mockito.when;
import static org.mockito.MockitoAnnotations.initMocks;

public class AuthServiceTest {
    @Mock
    private OrganisationRepository organisationRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private CognitoAuthServiceImpl cognitoAuthService;
    @Mock
    private AccountAdminRepository accountAdminRepository;
    private User user;
    private AuthService authService;
    private AccountAdmin accountAdmin;

    @Before
    public void setup() {
        initMocks(this);
//        cognitoAuthService = new CognitoUserContextServiceImpl(organisationRepository, userRepository, "poolId", "clientId");
        authService = new AuthService(cognitoAuthService, userRepository, organisationRepository, accountAdminRepository);
        String uuid = "9ecc2805-6528-47ee-8267-9368b266ad39";
        user = new User();
        user.setUuid(uuid);
        user.setOrganisationId(1L);
        accountAdmin = new AccountAdmin();
        accountAdmin.setUser(user);
    }

    @Test
    public void shouldReturnEmptyUserContextIfUserCannotBeFoundInToken() {
        when(cognitoAuthService.getUserFromToken("some token")).thenReturn(null);
        UserContext userContext = authService.authenticateByToken("some token", null);
        assertThat(userContext.getUser(), is(equalTo(null)));
        assertThat(userContext.getOrganisation(), is(equalTo(null)));
        assertThat(userContext.getRoles().size(), is(equalTo(0)));
    }

    @Test
    public void shouldAddOrganisationToContext() throws UnsupportedEncodingException {
        Organisation organisation = new Organisation();
        when(organisationRepository.findOne(1L)).thenReturn(organisation);
        when(userRepository.findByUuid(user.getUuid())).thenReturn(user);
        when(cognitoAuthService.getUserFromToken("some token")).thenReturn(user);
//        Algorithm algorithm = Algorithm.HMAC256("not very useful secret");
//        String token = createForBaseToken(user.getUuid()).sign(algorithm);
        UserContext userContext = authService.authenticateByToken("some token", null);
        assertThat(userContext.getOrganisation(), is(equalTo(organisation)));
    }

    private JWTCreator.Builder createForBaseToken(String userUuid) {
        return JWT.create().withClaim("custom:userUUID", userUuid);
    }

    @Test
    public void shouldAddRolesToContext() throws UnsupportedEncodingException {
        Organisation organisation = new Organisation();
        List<AccountAdmin> adminUser = new ArrayList<>();
        adminUser.add(accountAdmin);
        when(organisationRepository.findOne(1L)).thenReturn(organisation);
        when(userRepository.findByUuid(user.getUuid())).thenReturn(user);
        when(cognitoAuthService.getUserFromToken("some token")).thenReturn(user);

        UserContext userContext = authService.authenticateByToken("some token", null);
        assertThat(userContext.getRoles(), contains(User.USER));
        assertThat(userContext.getRoles().size(), is(equalTo(1)));

        user.setAccountAdmin(null);
        user.setOrgAdmin(true);

        userContext = authService.authenticateByToken("some token", null);
        assertThat(userContext.getRoles().size(), is(equalTo(2)));
        assertThat(userContext.getRoles(), containsInAnyOrder(User.ORGANISATION_ADMIN, User.USER));

        user.setAccountAdmin(accountAdmin);
        when(accountAdminRepository.findByUser_Id(user.getId())).thenReturn(adminUser);
        user.setOrgAdmin(false);
        userContext = authService.authenticateByToken("some token", null);
        assertThat(userContext.getRoles().size(), is(equalTo(1)));
        assertThat(userContext.getRoles(), contains(User.ADMIN));

        user.setAccountAdmin(null);
        when(accountAdminRepository.findByUser_Id(user.getId())).thenReturn(new ArrayList<>());
        user.setOrgAdmin(false);
        userContext = authService.authenticateByToken("some token", null);
        assertThat(userContext.getRoles().size(), is(equalTo(1)));
        assertThat(userContext.getRoles(), contains(User.USER));

        user.setAccountAdmin(accountAdmin);
        when(accountAdminRepository.findByUser_Id(user.getId())).thenReturn(adminUser);
        user.setOrgAdmin(true);
        userContext = authService.authenticateByToken("some token", null);
        assertThat(userContext.getRoles().size(), is(equalTo(3)));
        assertThat(userContext.getRoles(), containsInAnyOrder(User.ADMIN, User.ORGANISATION_ADMIN, User.USER));
    }

    @Test
    public void shouldSetcontextBasedOnUserId() {
        Organisation organisation = new Organisation();
        when(organisationRepository.findOne(1L)).thenReturn(organisation);
        when(userRepository.findById(100L)).thenReturn(Optional.of(user));
        when(cognitoAuthService.getUserFromToken("some token")).thenReturn(user);
        UserContext userContext = authService.authenticateByUserId(100L, null);
        assertThat(userContext.getUser(), is(equalTo(user)));
        assertThat(userContext.getOrganisation(), is(equalTo(organisation)));
    }
}
