package org.avni.framework.sync;

import org.joda.time.DateTime;
import org.joda.time.format.ISODateTimeFormat;
import org.avni.domain.User;
import org.avni.framework.security.UserContextHolder;
import org.avni.util.UserUtil;
import org.keycloak.KeycloakPrincipal;
import org.keycloak.KeycloakSecurityContext;
import org.keycloak.adapters.springsecurity.token.KeycloakAuthenticationToken;
import org.keycloak.representations.AccessToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.handler.HandlerInterceptorAdapter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

@Component
public class TransactionalResourceInterceptor extends HandlerInterceptorAdapter {

    private final Map<String, Integer> nowMap = new HashMap<String, Integer>() {{
        put("live", 10);
    }};
    private final Environment environment;
    private UserUtil userUtil;

    @Autowired
    public TransactionalResourceInterceptor(UserUtil userUtil, Environment environment) {
        this.userUtil = userUtil;
        this.environment = environment;
    }

    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response, Object object) throws Exception {
        if (request.getMethod().equals(RequestMethod.GET.name())) {
            ((MutableRequestWrapper) request).addParameter("now", getNowMinus10Seconds().toString(ISODateTimeFormat.dateTime()));
            User user = UserContextHolder.getUser();
//            KeycloakPrincipal principal = (KeycloakPrincipal) ((KeycloakAuthenticationToken) request.getUserPrincipal()).getPrincipal();
//            AccessToken token = principal.getKeycloakSecurityContext().getToken();
//            String userName = token.getPreferredUsername();
            // this is how to get the real userName (or rather the login name)
            if (user == null) {
                response.sendError(HttpServletResponse.SC_FORBIDDEN, "User not available from UserContext. Check for Auth errors");
                return false;
            }
            ((MutableRequestWrapper) request).addParameter("catchmentId", String.valueOf(userUtil.getCatchmentId()));
        }
        return true;
    }

    /**
     * This is a hack to fix the problem of missing data when multiple users sync at the same time.
     * During sync, it is possible that the tables being sync GETted are also being updated concurrently.
     * <p>
     * By retrieving data that is slightly old, we ensure that any data that was updated during the sync
     * is retrieved completely during the next sync process, and we do not miss any data.
     */
    private DateTime getNowMinus10Seconds() {
        return new DateTime().minusSeconds(nowMap.getOrDefault(environment.getActiveProfiles()[0], 0));
    }

}
