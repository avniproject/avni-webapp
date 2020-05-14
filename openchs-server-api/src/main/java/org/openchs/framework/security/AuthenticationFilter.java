package org.openchs.framework.security;

import org.openchs.domain.UserContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.util.StringUtils;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

public class AuthenticationFilter extends BasicAuthenticationFilter {
    public static final String USER_NAME_HEADER = "USER-NAME";
    public static final String AUTH_TOKEN_HEADER = "AUTH-TOKEN";
    public static final String ORGANISATION_UUID = "ORGANISATION-UUID";
    private static Logger logger = LoggerFactory.getLogger(AuthenticationFilter.class);

    private AuthService authService;
    private Boolean isDev;
    private String defaultUserName;

    public AuthenticationFilter(AuthenticationManager authenticationManager, AuthService authService, Boolean isDev, String defaultUserName) {
        super(authenticationManager);
        this.authService = authService;
        this.isDev = isDev;
        this.defaultUserName = defaultUserName;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain) throws IOException, ServletException {
        try {
            String username = request.getHeader(USER_NAME_HEADER);
            String authToken = request.getHeader(AUTH_TOKEN_HEADER);
            String organisationUUID = request.getHeader(ORGANISATION_UUID);
            String method = request.getMethod();
            String requestURI = request.getRequestURI();
            String queryString = request.getQueryString();

            logger.info(String.format("Processing %s %s?%s Header: %s", method, requestURI, queryString, username));
            UserContext userContext = isDev
                    ? authService.authenticateByUserName(StringUtils.isEmpty(username) ? defaultUserName : username, organisationUUID)
                    : authService.authenticateByToken(authToken, organisationUUID);

            logger.info(String.format("Processing %s %s?%s User: %s, Organisation: %s", method, requestURI, queryString, userContext.getUserName(), userContext.getOrganisationName()));
            chain.doFilter(request, response);
            logger.info(String.format("Processed %s %s?%s User: %s, Organisation: %s", method, requestURI, queryString, userContext.getUserName(), userContext.getOrganisationName()));
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

}
