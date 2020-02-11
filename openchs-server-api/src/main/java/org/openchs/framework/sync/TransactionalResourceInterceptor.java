package org.openchs.framework.sync;

import org.joda.time.DateTime;
import org.joda.time.format.ISODateTimeFormat;
import org.openchs.domain.User;
import org.openchs.framework.security.UserContextHolder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.handler.HandlerInterceptorAdapter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

@Component
public class TransactionalResourceInterceptor extends HandlerInterceptorAdapter {
    private static final Long DEFAULT_CATCHMENT_ID_FOR_DEV = 1L;
    private final Environment environment;

    private final Map<String, Integer> nowMap = new HashMap<String, Integer>() {{
        put("live", 10);
    }};

    @Autowired
    public TransactionalResourceInterceptor(Environment environment) {
        this.environment = environment;
    }

    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response, Object object) throws Exception {
        if (request.getMethod().equals(RequestMethod.GET.name())) {
            ((MutableRequestWrapper) request).addParameter("now", getNowMinus10Seconds().toString(ISODateTimeFormat.dateTime()));
            User user = UserContextHolder.getUser();
            if (user == null) {
                response.sendError(HttpServletResponse.SC_FORBIDDEN, "User not available from UserContext. Check for Auth errors");
                return false;
            }
            Long catchmentId = getCatchmentId(response);
            ((MutableRequestWrapper) request).addParameter("catchmentId", String.valueOf(catchmentId));
        }
        return true;
    }

    /**
     * This is a hack to fix the problem of missing data when multiple users sync at the same time.
     * During sync, it is possible that the tables being sync GETted are also being updated concurrently.
     *
     * By retrieving data that is slightly old, we ensure that any data that was updated during the sync
     * is retrieved completely during the next sync process, and we do not miss any data.
     *
     */
    private DateTime getNowMinus10Seconds() {
        return new DateTime().minusSeconds(nowMap.getOrDefault(environment.getActiveProfiles()[0], 0));
    }

    private Long getCatchmentId(HttpServletResponse response) throws IOException {
        User user = UserContextHolder.getUser();
        Objects.requireNonNull(user, "User not available from UserContext. Check for Auth errors");
        return user.getCatchmentId().orElse(isDev() ? DEFAULT_CATCHMENT_ID_FOR_DEV : null);
    }

    private boolean isDev() {
        String[] activeProfiles = environment.getActiveProfiles();
        return activeProfiles.length == 1 && (activeProfiles[0].equals("dev") || activeProfiles[0].equals("test"));
    }

}
