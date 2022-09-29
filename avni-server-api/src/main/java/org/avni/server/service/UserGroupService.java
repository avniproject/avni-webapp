package org.avni.server.service;

import org.avni.server.dao.UserGroupRepository;
import org.avni.server.domain.CHSEntity;
import org.avni.server.domain.User;
import org.avni.server.framework.security.UserContextHolder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import org.joda.time.DateTime;

@Service
public class UserGroupService implements NonScopeAwareService {

    private final UserGroupRepository userGroupRepository;

    @Autowired
    public UserGroupService(UserGroupRepository userGroupRepository) {
        this.userGroupRepository = userGroupRepository;
    }

    @Override
    public boolean isNonScopeEntityChanged(DateTime lastModifiedDateTime) {
        User user = UserContextHolder.getUserContext().getUser();
        return userGroupRepository.existsByUserIdAndLastModifiedDateTimeGreaterThan(user.getId(), CHSEntity.toDate(lastModifiedDateTime));
    }
}

