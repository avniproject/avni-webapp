package org.avni.server.service;

import org.avni.server.dao.GroupSubjectRepository;
import org.avni.server.dao.OperatingIndividualScopeAwareRepository;
import org.avni.server.dao.SubjectTypeRepository;
import org.avni.server.dao.SyncParameters;
import org.avni.server.domain.*;
import org.avni.server.framework.security.UserContextHolder;
import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
        return subjectType != null && isChangedBySubjectTypeRegistrationLocationType(user, lastModifiedDateTime, subjectType.getId(), subjectType, SyncParameters.SyncEntityName.GroupSubject);
    }

    @Override
    public OperatingIndividualScopeAwareRepository repository() {
        return groupSubjectRepository;
    }

    public GroupSubject save(GroupSubject groupSubject) {
        this.addSyncAttributes(groupSubject);
        return groupSubjectRepository.save(groupSubject);
    }

    private void addSyncAttributes(GroupSubject groupSubject) {
        Individual groupIndividual = groupSubject.getGroupSubject();
        SubjectType subjectType = groupIndividual.getSubjectType();
        ObservationCollection observations = groupIndividual.getObservations();
        Individual memberIndividual = groupSubject.getMemberSubject();
        if (groupIndividual.getAddressLevel() != null) {
            groupSubject.setGroupSubjectAddressId(groupIndividual.getAddressLevel().getId());
        }
        if (memberIndividual.getAddressLevel() != null) {
            groupSubject.setMemberSubjectAddressId(memberIndividual.getAddressLevel().getId());
        }
        if (subjectType.getSyncRegistrationConcept1() != null) {
            groupSubject.setGroupSubjectSyncConcept1Value(observations.getStringValue(subjectType.getSyncRegistrationConcept1()));
        }
        if (subjectType.getSyncRegistrationConcept2() != null) {
            groupSubject.setGroupSubjectSyncConcept2Value(observations.getStringValue(subjectType.getSyncRegistrationConcept2()));
        }
    }
}
