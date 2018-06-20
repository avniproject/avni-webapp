package org.openchs.service;

import org.joda.time.DateTime;
import org.openchs.dao.UserRepository;
import org.openchs.domain.Audit;
import org.openchs.domain.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
}