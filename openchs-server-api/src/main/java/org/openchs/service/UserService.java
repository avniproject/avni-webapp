package org.openchs.service;

import org.openchs.dao.UserRepository;
import org.openchs.domain.Facility;
import org.openchs.domain.User;
import org.openchs.domain.UserContext;
import org.openchs.domain.UserFacilityMapping;
import org.openchs.framework.security.UserContextHolder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
public class UserService {
    private UserRepository userRepository;
    private static Logger logger = LoggerFactory.getLogger(UserService.class);

    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public Facility getUserFacility() {
        UserContext userContext = UserContextHolder.getUserContext();
        User user = userContext.getUser();
        Set<UserFacilityMapping> userFacilityMappings = user.getUserFacilityMappings();
        if (userFacilityMappings.size() > 1) {
            throw new AssertionError("User cannot belong to more than one facility yet");
        } else if (userFacilityMappings.size() == 1) {
            return userFacilityMappings.stream().findFirst().get().getFacility();
        }
        return null;
    }

    public User getCurrentUser() {
        UserContext userContext = UserContextHolder.getUserContext();
        return userContext.getUser();
    }
}