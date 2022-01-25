package org.avni.service;

import org.avni.dao.IndividualRepository;
import org.avni.dao.OperatingIndividualScopeAwareRepository;
import org.avni.dao.SubjectMigrationRepository;
import org.avni.dao.SubjectTypeRepository;
import org.avni.domain.*;
import org.avni.framework.security.UserContextHolder;
import org.avni.web.IndividualController;
import org.joda.time.DateTime;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;

@Service
public class SubjectMigrationService implements ScopeAwareService {

    private SubjectMigrationRepository subjectMigrationRepository;
    private SubjectTypeRepository subjectTypeRepository;
    private IndividualRepository individualRepository;
    private static org.slf4j.Logger logger = LoggerFactory.getLogger(IndividualController.class);

    @Autowired
    public SubjectMigrationService(SubjectMigrationRepository subjectMigrationRepository, SubjectTypeRepository subjectTypeRepository, IndividualRepository individualRepository) {
        this.subjectMigrationRepository = subjectMigrationRepository;
        this.subjectTypeRepository = subjectTypeRepository;
        this.individualRepository = individualRepository;
    }

    @Override
    public OperatingIndividualScopeAwareRepository repository() {
        return subjectMigrationRepository;
    }

    @Override
    public boolean isScopeEntityChanged(DateTime lastModifiedDateTime, String subjectTypeUUID) {
        SubjectType subjectType = subjectTypeRepository.findByUuid(subjectTypeUUID);
        User user = UserContextHolder.getUserContext().getUser();
        return subjectType != null && isChanged(user, lastModifiedDateTime, subjectType.getId());
    }

    @Transactional
    public void markSubjectMigrationIfRequired(String individualUuid, AddressLevel newAddressLevel) {
        Individual individual = individualRepository.findByUuid(individualUuid);
        if (individual == null || newAddressLevel == null || individual.getAddressLevel().getId() == newAddressLevel.getId()) {
            return;
        }

        logger.info(String.format("Migrating subject with UUID %s from %s to %s", individualUuid, individual.getAddressLevel().getTitleLineage(), newAddressLevel.getTitleLineage()));

        SubjectMigration subjectMigration = new SubjectMigration();
        subjectMigration.assignUUID();
        subjectMigration.setIndividual(individual);
        subjectMigration.setOldAddressLevel(individual.getAddressLevel());
        subjectMigration.setNewAddressLevel(newAddressLevel);
        subjectMigrationRepository.save(subjectMigration);
    }
}

