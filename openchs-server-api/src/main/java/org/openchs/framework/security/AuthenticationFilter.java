package org.openchs.framework.security;

import org.openchs.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.stereotype.Component;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static org.openchs.service.MetabaseAuthService.ADMIN_ROLE;
import static org.openchs.service.MetabaseAuthService.USER_ROLE;

@Component
public class AuthenticationFilter extends BasicAuthenticationFilter {

    private static final String AUTH_TOKEN = "AUTH-TOKEN";
    private final AuthService authService;
    public final static SimpleGrantedAuthority USER_AUTHORITY = new SimpleGrantedAuthority(USER_ROLE);
    public final static SimpleGrantedAuthority ADMIN_AUTHORITY = new SimpleGrantedAuthority(ADMIN_ROLE);

    @Autowired
    public AuthenticationFilter(AuthenticationManager authenticationManager, AuthService authService) {
        super(authenticationManager);
        this.authService = authService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain) throws IOException, ServletException {
        Authentication authentication = this.attemptAuthentication(request, response);
        SecurityContextHolder.getContext().setAuthentication(authentication);
        chain.doFilter(request, response);
    }

    private Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response) throws AuthenticationException, IOException, ServletException {
        String token = getAuthToken(request);
        Map<String, Boolean> roles = this.authService.validate(token);
        List<SimpleGrantedAuthority> authorities = Stream.of(USER_AUTHORITY, ADMIN_AUTHORITY)
                .filter(authority -> roles.get(authority.getAuthority()))
                .collect(Collectors.toList());
        if (authorities.isEmpty()) return null;
        return new AnonymousAuthenticationToken(token, token, authorities);
    }

    private String getAuthToken(HttpServletRequest request) {
        String token = request.getHeader(AUTH_TOKEN);
        return token == null || token.isEmpty() ? UUID.randomUUID().toString() : token;
    }
}
