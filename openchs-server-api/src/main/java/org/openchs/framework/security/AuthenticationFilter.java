package org.openchs.framework.security;

import org.openchs.domain.User;
import org.openchs.domain.UserContext;
import org.openchs.service.UserContextService;
import org.openchs.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.util.StringUtils;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class AuthenticationFilter extends BasicAuthenticationFilter {
    private static final String AUTH_TOKEN_HEADER = "AUTH-TOKEN";
    public static final String USER_NAME_HEADER = "USER-NAME";
    private final UserContextService userContextService;
    public final static SimpleGrantedAuthority USER_AUTHORITY = new SimpleGrantedAuthority(User.USER);
    public final static SimpleGrantedAuthority ADMIN_AUTHORITY = new SimpleGrantedAuthority(User.ADMIN);
    public final static SimpleGrantedAuthority ORGANISATION_ADMIN_AUTHORITY = new SimpleGrantedAuthority(User.ORGANISATION_ADMIN);

    private static Logger logger = LoggerFactory.getLogger(AuthenticationFilter.class);

    public AuthenticationFilter(AuthenticationManager authenticationManager, UserContextService userContextService) {
        super(authenticationManager);
        this.userContextService = userContextService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain) throws IOException, ServletException {
        try {
            logger.info(String.format("Processing %s %s?%s Header: %s", request.getMethod(), request.getRequestURI(), request.getQueryString(), request.getHeader("USER-NAME")));
            SecurityContextHolder.getContext().setAuthentication(createTempAuth());
            Authentication authentication = this.attemptAuthentication(request);
            SecurityContextHolder.getContext().setAuthentication(authentication);

            UserContext userContext = UserContextHolder.getUserContext();
            logger.info(String.format("Processing %s %s?%s User: %s, Organisation: %s", request.getMethod(), request.getRequestURI(), request.getQueryString(), userContext.getUserName(), userContext.getOrganisationName()));
            chain.doFilter(request, response);
            logger.info(String.format("Processed %s %s?%s User: %s, Organisation: %s", request.getMethod(), request.getRequestURI(), request.getQueryString(), userContext.getUserName(), userContext.getOrganisationName()));
        } catch (Exception exception) {
            this.logException(request, exception);
            throw exception;
        } finally {
            UserContextHolder.clear();
        }
    }

    private void logException(HttpServletRequest request, Exception exception) {
        logger.error("Exception on Request URI", request.getRequestURI());
        logger.error("Exception Message:", exception);
    }

    //Side effect
    private Authentication attemptAuthentication(HttpServletRequest request) throws AuthenticationException {
        String token = request.getHeader(AUTH_TOKEN_HEADER);
        if (token == null || StringUtils.isEmpty(token)) token = UUID.randomUUID().toString();
        String becomeUserName = request.getHeader(USER_NAME_HEADER);

        final UserContext userContext = this.userContextService.getUserContext(token, becomeUserName);

        List<SimpleGrantedAuthority> authorities = Stream.of(USER_AUTHORITY, ADMIN_AUTHORITY, ORGANISATION_ADMIN_AUTHORITY)
                .filter(authority -> userContext.getRoles().contains(authority.getAuthority()))
                .collect(Collectors.toList());
        UserContextHolder.create(userContext);

        if (authorities.isEmpty()) return null;
        return new AnonymousAuthenticationToken(token, token, authorities);
    }

    private Authentication createTempAuth() {
        String token = UUID.randomUUID().toString();
        List<SimpleGrantedAuthority> authorities = Stream.of(USER_AUTHORITY, ADMIN_AUTHORITY, ORGANISATION_ADMIN_AUTHORITY).collect(Collectors.toList());
        return new AnonymousAuthenticationToken(token, token, authorities);
    }
}
