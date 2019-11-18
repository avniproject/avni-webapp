package org.openchs.framework.security;

import org.openchs.dao.OrganisationRepository;
import org.openchs.dao.UserRepository;
import org.openchs.domain.User;
import org.openchs.domain.UserContext;
import org.openchs.service.CognitoAuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import javax.validation.constraints.NotNull;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AuthService {
    public final static SimpleGrantedAuthority USER_AUTHORITY = new SimpleGrantedAuthority(User.USER);
    public final static SimpleGrantedAuthority ADMIN_AUTHORITY = new SimpleGrantedAuthority(User.ADMIN);
    public final static SimpleGrantedAuthority ORGANISATION_ADMIN_AUTHORITY = new SimpleGrantedAuthority(User.ORGANISATION_ADMIN);
    public final static List<SimpleGrantedAuthority> ALL_AUTHORITIES = Arrays.asList(USER_AUTHORITY, ADMIN_AUTHORITY, ORGANISATION_ADMIN_AUTHORITY);
    private CognitoAuthService cognitoAuthService;
    private UserRepository userRepository;
    private OrganisationRepository organisationRepository;

    @Autowired
    public AuthService(CognitoAuthService cognitoAuthService, UserRepository userRepository, OrganisationRepository organisationRepository) {
        this.cognitoAuthService = cognitoAuthService;
        this.userRepository = userRepository;
        this.organisationRepository = organisationRepository;
    }

    public UserContext authenticateByUserName(String username) {
        becomeSuperUser();
        User user = userRepository.findByUsername(username);
        if (user != null) {
            return changeUser(user);
        }
        resetUser();
        throw new RuntimeException(String.format("Not found: User{username='%s'}", username));
    }

    public UserContext authenticateByToken(String authToken) {
        becomeSuperUser();
        User user = cognitoAuthService.getUserFromToken(authToken);
        if (user != null) {
            return changeUser(user);
        }
        resetUser();
        throw new RuntimeException(String.format("Can't determine User from token: token='%s'", authToken));
    }

    public UserContext authenticateByUserId(Long userId) {
        becomeSuperUser();
        Optional<User> user = userRepository.findById(userId);
        if (user.isPresent()) {
            return changeUser(user.get());
        }
        resetUser();
        throw new RuntimeException(String.format("Not found: User{id='%s'}", userId));
    }

    private Authentication attemptAuthentication(@NotNull User user) {
        UserContext userContext = new UserContext();
        UserContextHolder.create(userContext);
        userContext.setUser(user);
        userContext.setOrganisation(organisationRepository.findOne(user.getOrganisationId()));

        List<SimpleGrantedAuthority> authorities = ALL_AUTHORITIES.stream()
                .filter(authority -> userContext.getRoles().contains(authority.getAuthority()))
                .collect(Collectors.toList());

        if (authorities.isEmpty()) return null;
        return createTempAuth(authorities);
    }

    private UserContext changeUser(@NotNull User user) {
        SecurityContextHolder.getContext().setAuthentication(attemptAuthentication(user));
        return UserContextHolder.getUserContext();
    }

    private void becomeSuperUser() {
        SecurityContextHolder.getContext().setAuthentication(createTempAuth(ALL_AUTHORITIES));
    }

    private void resetUser() {
        SecurityContextHolder.getContext().setAuthentication(null);
        UserContextHolder.clear();
    }

    private Authentication createTempAuth(List<SimpleGrantedAuthority> authorities) {
        String token = UUID.randomUUID().toString();
        return new AnonymousAuthenticationToken(token, token, authorities);
    }

}
