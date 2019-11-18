package org.openchs.framework.security;

import org.openchs.domain.User;
import org.openchs.domain.UserContext;

public class UserContextHolder {
    private static ThreadLocal<UserContext> userContext = new ThreadLocal<>();

    private UserContextHolder() {
    }

    public static void create(UserContext context) {
        userContext.set(context);
    }

    public static UserContext getUserContext() {
        return userContext.get();
    }

    public static void clear() {
        userContext.remove();
    }

    public static User getUser() {
        UserContext context = getUserContext();
        return context != null ? context.getUser() : null;
    }
}
