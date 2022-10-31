package org.avni.server.util;

import org.avni.server.domain.User;
import org.avni.server.framework.security.UserContextHolder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Objects;

@Component
public class UserUtil {

    private static final Long DEFAULT_CATCHMENT_ID_FOR_DEV = 1L;
    private Boolean isDev;

    @Autowired
    public UserUtil(Boolean isDev) {
        this.isDev = isDev;
    }

    public Long getCatchmentId() {
        User user = UserContextHolder.getUser();
        Objects.requireNonNull(user, "User not available from UserContext. Check for Auth errors");
        return user.getCatchmentId().orElse(isDev ? DEFAULT_CATCHMENT_ID_FOR_DEV : null);
    }
}
