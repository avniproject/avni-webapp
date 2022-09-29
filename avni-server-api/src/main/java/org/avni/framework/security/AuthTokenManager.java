package org.avni.framework.security;

import com.auth0.jwt.JWT;
import com.auth0.jwt.interfaces.DecodedJWT;
import org.springframework.util.StringUtils;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.Arrays;
import java.util.Date;
import java.util.regex.Pattern;

public class AuthTokenManager {
    public static final String AUTH_TOKEN_COOKIE = "auth-token";
    public static final Pattern PARAM_SEPARATOR_PATTERN = Pattern.compile("[&;]");
    public static final String AUTH_TOKEN = "AUTH-TOKEN=";

    public static AuthTokenManager getInstance() {
        return new AuthTokenManager();
    }

    public String getDerivedAuthToken(HttpServletRequest request, String queryString) {
        String authToken = request.getHeader(AuthenticationFilter.AUTH_TOKEN_HEADER);
        authToken = getAuthTokenFromQueryString(authToken, queryString);
        String derivedAuthToken = authToken;
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            Cookie authCookie = Arrays.stream(request.getCookies()).filter(cookie -> cookie.getName().equals(AUTH_TOKEN_COOKIE)).findAny().orElse(null);
            if ((authToken == null || authToken.isEmpty()) && authCookie != null && !authCookie.getValue().isEmpty()) {
                derivedAuthToken = authCookie.getValue();
            }
        }
        return derivedAuthToken;
    }

    public void setAuthCookie(HttpServletRequest request, HttpServletResponse response, String authToken) {
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

    /**
     * @param authToken
     * @param queryString
     * @return param authToken, if it has content.
     * queryAuthToken, if param authToken is empty and param queryString contains an auth-token.
     * null, in all other cases.
     */
    private String getAuthTokenFromQueryString(String authToken, String queryString) {
        if (!StringUtils.hasText(authToken) && StringUtils.hasText(queryString)) {
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