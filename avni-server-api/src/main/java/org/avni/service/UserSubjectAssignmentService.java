package org.avni.service;

import org.avni.dao.UserSubjectAssignmentRepository;
import org.avni.domain.CHSEntity;
import org.avni.domain.User;
import org.avni.framework.security.UserContextHolder;
import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserSubjectAssignmentService implements NonScopeAwareService {

    private final UserSubjectAssignmentRepository userSubjectAssignmentRepository;

    @Autowired
    public UserSubjectAssignmentService(UserSubjectAssignmentRepository userSubjectAssignmentRepository) {
        this.userSubjectAssignmentRepository = userSubjectAssignmentRepository;
    }

    @Override
    public boolean isNonScopeEntityChanged(DateTime lastModifiedDateTime) {
        User user = UserContextHolder.getUserContext().getUser();
        return userSubjectAssignmentRepository.existsByUserAndIsVoidedTrueAndLastModifiedDateTimeGreaterThan(user, CHSEntity.toDate(lastModifiedDateTime));
    }
}
