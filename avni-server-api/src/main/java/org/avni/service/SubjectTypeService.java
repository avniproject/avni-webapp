package org.avni.service;

import org.avni.application.Subject;
import org.avni.dao.OperationalSubjectTypeRepository;
import org.avni.dao.SubjectTypeRepository;
import org.avni.domain.*;
import org.avni.framework.security.UserContextHolder;
import org.avni.web.request.OperationalSubjectTypeContract;
import org.avni.web.request.SubjectTypeContract;
import org.avni.web.request.webapp.SubjectTypeContractWeb;
import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.JobParametersInvalidException;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.batch.core.repository.JobExecutionAlreadyRunningException;
import org.springframework.batch.core.repository.JobInstanceAlreadyCompleteException;
import org.springframework.batch.core.repository.JobRestartException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Objects;
import java.util.UUID;
import java.util.stream.Stream;

@Service
public class SubjectTypeService implements NonScopeAwareService {

    private final Logger logger;
    private final OperationalSubjectTypeRepository operationalSubjectTypeRepository;
    private SubjectTypeRepository subjectTypeRepository;
    private Job syncAttributesJob;
    private JobLauncher syncAttributesJobLauncher;

    @Autowired
    public SubjectTypeService(SubjectTypeRepository subjectTypeRepository,
                              OperationalSubjectTypeRepository operationalSubjectTypeRepository,
                              Job syncAttributesJob,
                              JobLauncher syncAttributesJobLauncher) {
        this.subjectTypeRepository = subjectTypeRepository;
        this.operationalSubjectTypeRepository = operationalSubjectTypeRepository;
        this.syncAttributesJob = syncAttributesJob;
        this.syncAttributesJobLauncher = syncAttributesJobLauncher;
        logger = LoggerFactory.getLogger(this.getClass());
    }

    public void saveSubjectType(SubjectTypeContract subjectTypeRequest) {
        logger.info(String.format("Creating subjectType: %s", subjectTypeRequest.toString()));
        SubjectType subjectType = subjectTypeRepository.findByUuid(subjectTypeRequest.getUuid());
        if (subjectType == null) {
            subjectType = new SubjectType();
        }
        subjectType.setUuid(subjectTypeRequest.getUuid());
        subjectType.setVoided(subjectTypeRequest.isVoided());
        subjectType.setName(subjectTypeRequest.getName());
        subjectType.setGroup(subjectTypeRequest.isGroup());
        subjectType.setHousehold(subjectTypeRequest.isHousehold());
        subjectType.setActive(subjectTypeRequest.getActive());
        subjectType.setAllowEmptyLocation(subjectTypeRequest.isAllowEmptyLocation());
        subjectType.setUniqueName(subjectTypeRequest.isUniqueName());
        subjectType.setValidFirstNameFormat(subjectTypeRequest.getValidFirstNameFormat());
        subjectType.setValidLastNameFormat(subjectTypeRequest.getValidLastNameFormat());
        subjectType.setType(Subject.valueOf(subjectTypeRequest.getType()));
        subjectType.setSubjectSummaryRule(subjectTypeRequest.getSubjectSummaryRule());
        subjectType.setIconFileS3Key(subjectTypeRequest.getIconFileS3Key());
        subjectTypeRepository.save(subjectType);
    }

    public void createOperationalSubjectType(OperationalSubjectTypeContract operationalSubjectTypeContract, Organisation organisation) {
        String subjectTypeUUID = operationalSubjectTypeContract.getSubjectType().getUuid();
        SubjectType subjectType = subjectTypeRepository.findByUuid(subjectTypeUUID);
        if (subjectType == null) {
            logger.info(String.format("SubjectType not found for uuid: '%s'", subjectTypeUUID));
        }

        OperationalSubjectType operationalSubjectType = operationalSubjectTypeRepository.findByUuid(operationalSubjectTypeContract.getUuid());

        if (operationalSubjectType == null) {
            operationalSubjectType = new OperationalSubjectType();
        }

        operationalSubjectType.setUuid(operationalSubjectTypeContract.getUuid());
        operationalSubjectType.setName(operationalSubjectTypeContract.getName());
        operationalSubjectType.setSubjectType(subjectType);
        operationalSubjectType.setOrganisationId(organisation.getId());
        operationalSubjectType.setVoided(operationalSubjectTypeContract.isVoided());
        operationalSubjectTypeRepository.save(operationalSubjectType);
    }

    public SubjectType createIndividualSubjectType() {
        SubjectType subjectType = new SubjectType();
        subjectType.assignUUID();
        subjectType.setName("Individual");
        SubjectType savedSubjectType = subjectTypeRepository.save(subjectType);
        saveIndividualOperationalSubjectType(savedSubjectType);
        return savedSubjectType;
    }

    private void saveIndividualOperationalSubjectType(SubjectType subjectType) {
        OperationalSubjectType operationalSubjectType = new OperationalSubjectType();
        operationalSubjectType.assignUUID();
        operationalSubjectType.setName(subjectType.getName());
        operationalSubjectType.setSubjectType(subjectType);
        operationalSubjectTypeRepository.save(operationalSubjectType);
    }

    @Override
    public boolean isNonScopeEntityChanged(DateTime lastModifiedDateTime) {
        return subjectTypeRepository.existsByLastModifiedDateTimeGreaterThan(lastModifiedDateTime);
    }

    public Stream<SubjectType> getAll() {
        return operationalSubjectTypeRepository.findAllByIsVoidedFalse().stream().map(OperationalSubjectType::getSubjectType);
    }

    public void updateSyncAttributesIfRequired(SubjectTypeContractWeb request, SubjectType subjectType) {
        Boolean isSyncConcept1Changed = !Objects.equals(request.getSyncRegistrationConcept1(), subjectType.getSyncRegistrationConcept1());
        Boolean isSyncConcept2Changed = !Objects.equals(request.getSyncRegistrationConcept2(), subjectType.getSyncRegistrationConcept2());
        if (isSyncConcept1Changed || isSyncConcept2Changed) {
            if (isSyncConcept1Changed)
                subjectType.setSyncRegistrationConcept1Usable(false);
            if (isSyncConcept2Changed)
                subjectType.setSyncRegistrationConcept2Usable(false);
            UserContext userContext = UserContextHolder.getUserContext();
            User user = userContext.getUser();
            Organisation organisation = userContext.getOrganisation();
            String jobUUID = UUID.randomUUID().toString();
            JobParameters jobParameters =
                    new JobParametersBuilder()
                            .addString("uuid", jobUUID)
                            .addString("organisationUUID", organisation.getUuid())
                            .addLong("userId", user.getId(), false)
                            .addLong("subjectTypeId", subjectType.getId())
                            .addString("syncConcept1Changed", isSyncConcept1Changed.toString())
                            .addString("syncConcept2Changed", isSyncConcept2Changed.toString())
                            .toJobParameters();
            try {
                syncAttributesJobLauncher.run(syncAttributesJob, jobParameters);
            } catch (JobParametersInvalidException | JobExecutionAlreadyRunningException | JobInstanceAlreadyCompleteException | JobRestartException e) {
                throw new RuntimeException(String.format("Error while starting the sync attribute job, %s", e.getMessage()));
            }
        }
    }
}
