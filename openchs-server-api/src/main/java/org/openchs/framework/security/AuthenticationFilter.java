package org.openchs.framework.security;

import org.openchs.domain.UserContext;
import org.openchs.service.UserContextService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
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
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class AuthenticationFilter extends BasicAuthenticationFilter {

    private static final String AUTH_TOKEN_HEADER = "AUTH-TOKEN";
    public static final String ORGANISATION_NAME_HEADER = "ORGANISATION-NAME";
    private final UserContextService userContextService;
    public final static SimpleGrantedAuthority USER_AUTHORITY = new SimpleGrantedAuthority(UserContext.USER);
    public final static SimpleGrantedAuthority ADMIN_AUTHORITY = new SimpleGrantedAuthority(UserContext.ADMIN);
    public final static SimpleGrantedAuthority ORGANISATION_ADMIN_AUTHORITY = new SimpleGrantedAuthority(UserContext.ORGANISATION_ADMIN);

    @Autowired
    public AuthenticationFilter(AuthenticationManager authenticationManager, UserContextService userContextService) {
        super(authenticationManager);
        this.userContextService = userContextService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain) throws IOException, ServletException {
        try {
            Authentication authentication = this.attemptAuthentication(request, response);
            SecurityContextHolder.getContext().setAuthentication(authentication);
            chain.doFilter(request, response);
        } finally {
            UserContextHolder.clear();
        }
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
