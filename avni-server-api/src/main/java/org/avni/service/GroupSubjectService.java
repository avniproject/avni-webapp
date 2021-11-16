package org.avni.service;

import org.joda.time.DateTime;
import org.avni.dao.GroupSubjectRepository;
import org.avni.dao.OperatingIndividualScopeAwareRepository;
import org.avni.dao.SubjectTypeRepository;
import org.avni.domain.SubjectType;
import org.avni.domain.User;
import org.avni.framework.security.UserContextHolder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import org.joda.time.DateTime;

@Service
public class GroupSubjectService implements ScopeAwareService {

    private final GroupSubjectRepository groupSubjectRepository;
    private final SubjectTypeRepository subjectTypeRepository;

    @Autowired
    public GroupSubjectService(GroupSubjectRepository groupSubjectRepository, SubjectTypeRepository subjectTypeRepository) {
        this.groupSubjectRepository = groupSubjectRepository;
        this.subjectTypeRepository = subjectTypeRepository;
    }

    @Override
    public boolean isScopeEntityChanged(DateTime lastModifiedDateTime, String groupSubjectTypeUuid) {
        SubjectType subjectType = subjectTypeRepository.findByUuid(groupSubjectTypeUuid);
        User user = UserContextHolder.getUserContext().getUser();
        return subjectType != null && isChanged(user, lastModifiedDateTime, subjectType.getId());
    }

    @Override
    public OperatingIndividualScopeAwareRepository repository() {
        return groupSubjectRepository;
    }
}
