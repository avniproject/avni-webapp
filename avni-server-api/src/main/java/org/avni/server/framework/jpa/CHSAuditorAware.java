package org.avni.server.framework.jpa;

import org.avni.server.domain.User;
import org.avni.server.domain.UserContext;
import org.avni.server.framework.security.UserContextHolder;
import org.springframework.data.domain.AuditorAware;

import java.util.Optional;

public class CHSAuditorAware implements AuditorAware<User> {
    @Override
    public Optional<User> getCurrentAuditor() {
        UserContext userContext = UserContextHolder.getUserContext();
        return Optional.of(userContext.getUser());
    }
}
