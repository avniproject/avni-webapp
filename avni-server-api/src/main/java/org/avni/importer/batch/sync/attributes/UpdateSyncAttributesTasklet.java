package org.avni.importer.batch.sync.attributes;

import org.avni.dao.SubjectMigrationRepository;
import org.avni.dao.SubjectTypeRepository;
import org.avni.domain.SubjectType;
import org.avni.framework.security.AuthService;
import org.avni.util.S;
import org.springframework.batch.core.StepContribution;
import org.springframework.batch.core.configuration.annotation.JobScope;
import org.springframework.batch.core.scope.context.ChunkContext;
import org.springframework.batch.core.step.tasklet.Tasklet;
import org.springframework.batch.repeat.RepeatStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@JobScope
public class UpdateSyncAttributesTasklet implements Tasklet {

    private AuthService authService;
    private SubjectTypeRepository subjectTypeRepository;
    private SubjectMigrationRepository subjectMigrationRepository;

    @Value("#{jobParameters['organisationUUID']}")
    private String organisationUUID;

    @Value("#{jobParameters['userId']}")
    private Long userId;

    @Value("#{jobParameters['subjectTypeId']}")
    private Long subjectTypeId;

    @Autowired
    public UpdateSyncAttributesTasklet(AuthService authService,
                                       SubjectTypeRepository subjectTypeRepository,
                                       SubjectMigrationRepository subjectMigrationRepository) {
        this.authService = authService;
        this.subjectTypeRepository = subjectTypeRepository;
        this.subjectMigrationRepository = subjectMigrationRepository;
    }

    @Override
    public RepeatStatus execute(StepContribution stepContribution, ChunkContext chunkContext) {
        authService.authenticateByUserId(userId, organisationUUID);
        SubjectType subjectType = subjectTypeRepository.findOne(subjectTypeId);
        String syncRegistrationConcept1 = S.getOrEmpty(subjectType.getSyncRegistrationConcept1());
        String syncRegistrationConcept2 = S.getOrEmpty(subjectType.getSyncRegistrationConcept2());
        subjectMigrationRepository.updateConceptSyncAttributes(subjectTypeId, syncRegistrationConcept1, syncRegistrationConcept2);
        return RepeatStatus.FINISHED;
    }
}
