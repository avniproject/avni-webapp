package org.avni.importer.batch.csv.writer;

import org.avni.application.FormMapping;
import org.avni.application.FormType;
import org.avni.dao.EncounterRepository;
import org.avni.dao.IndividualRepository;
import org.avni.dao.application.FormMappingRepository;
import org.avni.domain.Encounter;
import org.avni.domain.EntityApprovalStatus;
import org.avni.domain.Individual;
import org.avni.importer.batch.csv.contract.UploadRuleServerResponseContract;
import org.avni.importer.batch.csv.creator.BasicEncounterCreator;
import org.avni.importer.batch.csv.creator.DecisionCreator;
import org.avni.importer.batch.csv.creator.RuleServerInvoker;
import org.avni.importer.batch.csv.creator.VisitCreator;
import org.avni.importer.batch.csv.writer.header.EncounterHeaders;
import org.avni.importer.batch.model.Row;
import org.avni.service.EntityApprovalStatusService;
import org.avni.service.ObservationService;
import org.springframework.batch.item.ItemWriter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;


@Component
public class EncounterWriter implements ItemWriter<Row>, Serializable {

    private static EncounterHeaders headers = new EncounterHeaders();
    private EncounterRepository encounterRepository;
    private IndividualRepository individualRepository;
    private BasicEncounterCreator basicEncounterCreator;
    private EntityApprovalStatusService entityApprovalStatusService;
    private FormMappingRepository formMappingRepository;
    private ObservationService observationService;
    private RuleServerInvoker ruleServerInvoker;
    private VisitCreator visitCreator;
    private DecisionCreator decisionCreator;

    @Autowired
    public EncounterWriter(EncounterRepository encounterRepository,
                           IndividualRepository individualRepository,
                           BasicEncounterCreator basicEncounterCreator,
                           EntityApprovalStatusService entityApprovalStatusService,
                           FormMappingRepository formMappingRepository,
                           ObservationService observationService,
                           RuleServerInvoker ruleServerInvoker,
                           VisitCreator visitCreator, DecisionCreator decisionCreator) {
        this.encounterRepository = encounterRepository;
        this.individualRepository = individualRepository;
        this.basicEncounterCreator = basicEncounterCreator;
        this.entityApprovalStatusService = entityApprovalStatusService;
        this.formMappingRepository = formMappingRepository;
        this.observationService = observationService;
        this.ruleServerInvoker = ruleServerInvoker;
        this.visitCreator = visitCreator;
        this.decisionCreator = decisionCreator;
    }

    @Override
    public void write(List<? extends Row> rows) throws Exception {
        for (Row row : rows) write(row);
    }

    private void write(Row row) throws Exception {
        Encounter encounter = getOrCreateEncounter(row);

        List<String> allErrorMsgs = new ArrayList<>();
        Individual subject = getSubject(row);
        encounter.setIndividual(subject);
        basicEncounterCreator.updateEncounter(row, encounter, allErrorMsgs);
        FormMapping formMapping = formMappingRepository.getRequiredFormMapping(subject.getSubjectType().getUuid(), null, encounter.getEncounterType().getUuid(), FormType.Encounter);
        if (formMapping == null) {
            throw new Exception(String.format("No form found for the encounter type %s", encounter.getEncounterType().getName()));
        }
        UploadRuleServerResponseContract ruleResponse = ruleServerInvoker.getRuleServerResult(row, formMapping.getForm(), encounter, allErrorMsgs);
        encounter.setObservations(observationService.createObservations(ruleResponse.getObservations()));
        encounter.setVoided(false);
        encounter.assignUUIDIfRequired();
        decisionCreator.addEncounterDecisions(encounter.getObservations(), ruleResponse.getDecisions());
        decisionCreator.addRegistrationDecisions(subject.getObservations(), ruleResponse.getDecisions());

        Encounter savedEncounter = encounterRepository.save(encounter);
        individualRepository.save(subject);

        visitCreator.saveScheduledVisits(formMapping.getType(), subject.getUuid(), null, ruleResponse.getVisitSchedules(), savedEncounter.getUuid());
        if (formMapping.isEnableApproval()) {
            entityApprovalStatusService.createDefaultStatus(EntityApprovalStatus.EntityType.Encounter, savedEncounter.getId());
        }
    }

    private Individual getSubject(Row row) throws Exception {
        String subjectExternalId = row.get(headers.subjectId);
        if (subjectExternalId == null || subjectExternalId.isEmpty()) {
            throw new Exception(String.format("'%s' is required", headers.subjectId));
        }
        Individual individual = individualRepository.findByLegacyIdOrUuid(subjectExternalId);
        if (individual == null) {
            throw new Exception(String.format("'%s' '%s' not found in database", headers.subjectId, subjectExternalId));
        }
        return individual;
    }

    private Encounter getOrCreateEncounter(Row row) {
        String id = row.get(headers.id);
        Encounter existingEncounter = null;
        if (id != null && !id.isEmpty()) {
            existingEncounter = encounterRepository.findByLegacyIdOrUuid(id);
        }
        return existingEncounter == null ? createNewEncounter(id) : existingEncounter;
    }

    private Encounter createNewEncounter(String externalId) {
        Encounter encounter = new Encounter();
        encounter.setLegacyId(externalId);
        return encounter;
    }
}
