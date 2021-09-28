package org.avni.framework.jpa;

import org.avni.domain.User;
import org.avni.domain.UserContext;
import org.avni.framework.security.UserContextHolder;
import org.springframework.data.domain.AuditorAware;

import java.util.Optional;

public class CHSAuditorAware implements AuditorAware<User> {
    @Override
    public Optional<User> getCurrentAuditor() {
        UserContext userContext = UserContextHolder.getUserContext();
        return Optional.of(userContext.getUser());
    }
}
