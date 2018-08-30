package org.openchs.service;

import org.joda.time.DateTime;
import org.openchs.dao.UserRepository;
import org.openchs.domain.*;
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

    public User createUserIfNotPresent(String userName, Long organisationId) {
        User user = userRepository.findByName(userName);
        if (user == null) {
            logger.info(String.format("User=%s doesn't exist. Creating user.", userName));
            User newUser = User.newUser(userName, organisationId);
            User admin = userRepository.findByName("admin");
            newUser.setCreatedBy(admin);
            newUser.setLastModifiedBy(admin);
            DateTime now = DateTime.now();
            newUser.setCreatedDateTime(now);
            newUser.setLastModifiedDateTime(now);
            user = userRepository.save(newUser);
            logger.info(String.format("Created user=%s in org=%d", userName, organisationId));
        }
        return user;
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
}