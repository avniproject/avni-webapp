package org.openchs.framework.jpa;

import org.openchs.domain.User;
import org.openchs.domain.UserContext;
import org.openchs.framework.security.UserContextHolder;
import org.springframework.data.domain.AuditorAware;

import java.util.Optional;

public class CHSAuditorAware implements AuditorAware<User> {
    @Override
    public Optional<User> getCurrentAuditor() {
        UserContext userContext = UserContextHolder.getUserContext();
        return Optional.of(userContext.getUser());
    }
}