package org.openchs.framework.security;

import org.openchs.dao.UserRepository;
import org.openchs.domain.User;
import org.openchs.domain.UserContext;
import org.openchs.service.UserContextService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class AuthenticationFilter extends BasicAuthenticationFilter {
    private static final String AUTH_TOKEN_HEADER = "AUTH-TOKEN";
    public static final String ORGANISATION_NAME_HEADER = "ORGANISATION-NAME";
    private final UserContextService userContextService;
    private UserRepository userRepository;
    public final static SimpleGrantedAuthority USER_AUTHORITY = new SimpleGrantedAuthority(UserContext.USER);
    public final static SimpleGrantedAuthority ADMIN_AUTHORITY = new SimpleGrantedAuthority(UserContext.ADMIN);
    public final static SimpleGrantedAuthority ORGANISATION_ADMIN_AUTHORITY = new SimpleGrantedAuthority(UserContext.ORGANISATION_ADMIN);

    private static Logger logger = LoggerFactory.getLogger(AuthenticationFilter.class);

    public AuthenticationFilter(AuthenticationManager authenticationManager, UserContextService userContextService, UserRepository userRepository) {
        super(authenticationManager);
        this.userContextService = userContextService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain) throws IOException, ServletException {
        try {
            Authentication authentication = this.attemptAuthentication(request, response);
            SecurityContextHolder.getContext().setAuthentication(authentication);
            UserContext userContext = UserContextHolder.getUserContext();
            //doing this here because loading user before setting auth gives error
            this.setUserForInDevMode(userContext);

            User user = userRepository.findByName(userContext.getUsername());
            if (user == null) {
                logger.info(String.format("User=%s doesn't exist. Creating user.", userContext.getUsername()));
                User newUser = User.newUser(userContext.getUsername(), userContext.getOrganisation().getId());
                user = userRepository.save(newUser);
                logger.info(String.format("Created user=%s in org=%d", userContext.getUsername(), userContext.getOrganisation().getId()));
            }
            userContext.setUser(user);

            String organisationName = userContext.getOrganisationName();
            logger.info(String.format("Processing %s %s?%s User: %s, Organisation: %s", request.getMethod(), request.getRequestURI(), request.getQueryString(), userContext.getUsername(), organisationName));

            chain.doFilter(request, response);

            logger.info(String.format("Processed %s %s?%s User: %s, Organisation: %s", request.getMethod(), request.getRequestURI(), request.getQueryString(), userContext.getUsername(), organisationName));
        } catch (Exception exception) {
            this.logException(request, exception);
        } finally {
            UserContextHolder.clear();
        }
    }

    private void logException(HttpServletRequest request, Exception exception) {
        logger.error("Exception on Request URI", request.getRequestURI());
        logger.error("Exception Message:\n", exception.getMessage());
        logger.error("Exception Cause:\n", exception.getCause());
        StringWriter sw = new StringWriter();
        exception.printStackTrace(new PrintWriter(sw));
        logger.error("Exception Stacktrace:\n", sw.toString());
    }

    private void setUserForInDevMode(UserContext userContext) {
        this.userContextService.setUserForInDevMode(userContext);
    }

    private Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response) throws AuthenticationException, IOException, ServletException {
        String token = request.getHeader(AUTH_TOKEN_HEADER);
        if (token == null) token = UUID.randomUUID().toString();
        String becomeOrganisationName = request.getHeader(ORGANISATION_NAME_HEADER);

        final UserContext userContext = this.userContextService.getUserContext(token, becomeOrganisationName);

        List<SimpleGrantedAuthority> authorities = Stream.of(USER_AUTHORITY, ADMIN_AUTHORITY, ORGANISATION_ADMIN_AUTHORITY)
                .filter(authority -> userContext.getRoles().contains(authority.getAuthority()))
                .collect(Collectors.toList());

        //Side effect
        UserContextHolder.create(userContext);

        if (authorities.isEmpty()) return null;
        return new AnonymousAuthenticationToken(token, token, authorities);
    }
}
