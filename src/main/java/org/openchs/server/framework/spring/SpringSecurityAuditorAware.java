package org.openchs.server.framework.spring;

import org.openchs.server.domain.User;
import org.springframework.data.domain.AuditorAware;

public class SpringSecurityAuditorAware implements AuditorAware<User> {
    public User getCurrentAuditor() {
//        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
//        if (authentication == null || !authentication.isAuthenticated()) {
//            return null;
//        }
//        return ((MyUserDetails) authentication.getPrincipal()).getUser();

        return null;
    }
}