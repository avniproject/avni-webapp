package org.openchs.framework.jpa;

import org.openchs.dao.UserRepository;
import org.openchs.domain.User;
import org.openchs.domain.UserContext;
import org.openchs.framework.security.UserContextHolder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.AuditorAware;

public class CHSAuditorAware implements AuditorAware<User> {
    @Autowired
    private UserRepository userRepository;

    @Override
    public User getCurrentAuditor() {
        UserContext userContext = UserContextHolder.getUserContext();
        return userContext.getUser();
    }
}