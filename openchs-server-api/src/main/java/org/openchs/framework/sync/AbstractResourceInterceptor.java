package org.openchs.framework.sync;

import org.openchs.domain.User;
import org.openchs.framework.security.UserContextHolder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.web.servlet.handler.HandlerInterceptorAdapter;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Objects;

public abstract class AbstractResourceInterceptor extends HandlerInterceptorAdapter {

    private static final Long DEFAULT_CATCHMENT_ID_FOR_DEV = 1L;

    private final Environment environment;

    @Autowired
    public AbstractResourceInterceptor(Environment environment) {
        this.environment = environment;
    }

    public Long getCatchmentId(HttpServletResponse response) throws IOException {
        User user = UserContextHolder.getUser();
        Objects.requireNonNull(user, "User not available from UserContext. Check for Auth errors");
        return user.getCatchmentId().orElse(isDev() ? DEFAULT_CATCHMENT_ID_FOR_DEV : null);
    }

    private boolean isDev() {
        String[] activeProfiles = environment.getActiveProfiles();
        return activeProfiles.length == 1 && (activeProfiles[0].equals("dev") || activeProfiles[0].equals("test"));
    }

    public Environment getEnvironment() {
        return environment;
    }
}
