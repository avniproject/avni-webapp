package org.avni.framework.security;

import com.auth0.jwt.JWT;
import com.auth0.jwt.interfaces.DecodedJWT;
import org.avni.domain.UserContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.util.StringUtils;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Arrays;
import java.util.Date;
import java.util.regex.Pattern;

public class AuthenticationFilter extends BasicAuthenticationFilter {
    public static final String USER_NAME_HEADER = "USER-NAME";
    public static final String AUTH_TOKEN_HEADER = "AUTH-TOKEN";
    public static final String ORGANISATION_UUID = "ORGANISATION-UUID";
    public static final String AUTH_TOKEN_COOKIE = "auth-token";
    public static final Pattern PARAM_SEPARATOR_PATTERN = Pattern.compile("[&;]");
    public static final String AUTH_TOKEN = "AUTH-TOKEN=";
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
            authToken = getAuthTokenFromQueryString(authToken, queryString);
            Cookie[] cookies = request.getCookies();
            String derivedAuthToken = authToken;
            if (cookies != null) {
                Cookie authCookie = Arrays.stream(request.getCookies()).filter(cookie -> cookie.getName().equals(AUTH_TOKEN_COOKIE)).findAny().orElse(null);
                if ((authToken == null || authToken.isEmpty()) && authCookie != null && !authCookie.getValue().isEmpty()) {
                    derivedAuthToken = authCookie.getValue();
                }
            }
            UserContext userContext = isDev
                    ? authService.authenticateByUserName(StringUtils.isEmpty(username) ? defaultUserName : username, organisationUUID)
                    : authService.authenticateByToken(derivedAuthToken, organisationUUID);

            setAuthCookie(request, response, derivedAuthToken);
            long start = System.currentTimeMillis();
            chain.doFilter(request, response);
            long end = System.currentTimeMillis();
            logger.info(String.format("%s %s?%s User: %s Organisation: %s Time: %s ms", method, requestURI, queryString, userContext.getUserName(), userContext.getOrganisationName(), (end - start)));
        } catch (Exception exception) {
            this.logException(request, exception);
            throw exception;
        } finally {
            UserContextHolder.clear();
        }
    }

    private void setAuthCookie(HttpServletRequest request, HttpServletResponse response, String authToken) {
        if (request.getRequestURI().equals("/web/logout")) {
            response.addCookie(makeCookie("", 0));
            return;
        }
        if (authToken != null && !authToken.isEmpty()) {
            response.addCookie(makeCookie(authToken, getCookieMaxAge(authToken)));
        }
    }

    private int getCookieMaxAge(String authToken) {
        DecodedJWT jwt = JWT.decode(authToken);
        int expiryDuration = (int) ((jwt.getExpiresAt().getTime() - new Date().getTime()) / 1000) - 60;
        return expiryDuration < 0 ? 0 : expiryDuration;
    }

    private Cookie makeCookie(String value, int age) {
        Cookie cookie = new Cookie(AUTH_TOKEN_COOKIE, value);
        cookie.setMaxAge(age);
        cookie.setPath("/");
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        return cookie;
    }

    private void logException(HttpServletRequest request, Exception exception) {
        logger.error("Exception on Request URI", request.getRequestURI());
        logger.error("Exception Message:", exception);
    }

    /**
     * @param authToken
     * @param queryString
     * @return param authToken, if it has content.
     *         queryAuthToken, if param authToken is empty and param queryString contains an auth-token.
     *         null, in all other cases.
     */
    private String getAuthTokenFromQueryString(String authToken, String queryString) {
        if(!StringUtils.hasText(authToken) && StringUtils.hasText(queryString)) {
            return parseAuthToken(queryString);
        }
        return authToken;
    }

    private String parseAuthToken(String query) {
        if (query != null) {
            String[] params = PARAM_SEPARATOR_PATTERN.split(query);
            for (String param : params) {
                if (param.startsWith(AUTH_TOKEN)) {
                    return param.substring(AUTH_TOKEN.length());
                }
            }
        }
        return null;
    }
}
