package org.avni.server.service;

import org.avni.server.dao.SyncParameters;
import org.avni.server.domain.Individual;
import org.avni.server.domain.individualRelationship.IndividualRelationship;
import org.joda.time.DateTime;
import org.avni.server.dao.OperatingIndividualScopeAwareRepository;
import org.avni.server.dao.SubjectTypeRepository;
import org.avni.server.dao.individualRelationship.IndividualRelationshipRepository;
import org.avni.server.domain.SubjectType;
import org.avni.server.domain.User;
import org.avni.server.framework.security.UserContextHolder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
public class IndividualRelationshipService implements ScopeAwareService {

    private final IndividualRelationshipRepository individualRelationshipRepository;
    private final SubjectTypeRepository subjectTypeRepository;

    @Autowired
    public IndividualRelationshipService(IndividualRelationshipRepository individualRelationshipRepository, SubjectTypeRepository subjectTypeRepository) {
        this.individualRelationshipRepository = individualRelationshipRepository;
        this.subjectTypeRepository = subjectTypeRepository;
    }

    @Override
    public boolean isScopeEntityChanged(DateTime lastModifiedDateTime, String subjectTypeUUID) {
        SubjectType subjectType = subjectTypeRepository.findByUuid(subjectTypeUUID);
        User user = UserContextHolder.getUserContext().getUser();
        return subjectType != null && isChangedBySubjectTypeRegistrationLocationType(user, lastModifiedDateTime, subjectType.getId(), subjectType, SyncParameters.SyncEntityName.IndividualRelationShip);
    }

    @Override
    public OperatingIndividualScopeAwareRepository repository() {
        return individualRelationshipRepository;
    }

    public Set<IndividualRelationship> findByIndividual(Individual individual) {
        return individualRelationshipRepository.findByIndividual(individual);
    }
}
