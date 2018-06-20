package org.openchs.framework.jpa;

import org.openchs.dao.UserRepository;
import org.openchs.domain.User;
import org.openchs.domain.UserContext;
import org.openchs.framework.security.UserContextHolder;
import org.springframework.data.domain.AuditorAware;

public class CHSAuditorAware implements AuditorAware<User> {
    @Override
    public User getCurrentAuditor() {
        UserContext userContext = UserContextHolder.getUserContext();
        return userContext.getUser();
    }
}