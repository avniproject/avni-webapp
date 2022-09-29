package org.avni.server.importer.batch.csv.writer;

import org.avni.server.application.FormMapping;
import org.avni.server.application.FormType;
import org.avni.server.dao.EncounterRepository;
import org.avni.server.dao.IndividualRepository;
import org.avni.server.dao.application.FormMappingRepository;
import org.avni.server.domain.Encounter;
import org.avni.server.domain.EntityApprovalStatus;
import org.avni.server.domain.Individual;
import org.avni.server.importer.batch.csv.contract.UploadRuleServerResponseContract;
import org.avni.server.importer.batch.csv.writer.header.EncounterHeaders;
import org.avni.server.importer.batch.model.Row;
import org.avni.server.importer.batch.csv.creator.*;
import org.avni.server.service.EncounterService;
import org.avni.server.service.ObservationService;
import org.avni.server.service.OrganisationConfigService;
import org.springframework.batch.item.ItemWriter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;


@Component
public class EncounterWriter extends EntityWriter implements ItemWriter<Row>, Serializable {
    private EncounterRepository encounterRepository;
    private IndividualRepository individualRepository;
    private BasicEncounterCreator basicEncounterCreator;
    private FormMappingRepository formMappingRepository;
    private ObservationService observationService;
    private RuleServerInvoker ruleServerInvoker;
    private VisitCreator visitCreator;
    private DecisionCreator decisionCreator;
    private ObservationCreator observationCreator;
    private EncounterService encounterService;
    private EntityApprovalStatusWriter entityApprovalStatusWriter;

    @Autowired
    public EncounterWriter(EncounterRepository encounterRepository,
                           IndividualRepository individualRepository,
                           BasicEncounterCreator basicEncounterCreator,
                           FormMappingRepository formMappingRepository,
                           ObservationService observationService,
                           RuleServerInvoker ruleServerInvoker,
                           VisitCreator visitCreator,
                           DecisionCreator decisionCreator,
                           ObservationCreator observationCreator,
                           EncounterService encounterService,
                           EntityApprovalStatusWriter entityApprovalStatusWriter,
                           OrganisationConfigService organisationConfigService) {
        super(organisationConfigService);
        this.encounterRepository = encounterRepository;
        this.individualRepository = individualRepository;
        this.basicEncounterCreator = basicEncounterCreator;
        this.formMappingRepository = formMappingRepository;
        this.observationService = observationService;
        this.ruleServerInvoker = ruleServerInvoker;
        this.visitCreator = visitCreator;
        this.decisionCreator = decisionCreator;
        this.observationCreator = observationCreator;
        this.encounterService = encounterService;
        this.entityApprovalStatusWriter = entityApprovalStatusWriter;
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
        encounter.setVoided(false);
        encounter.assignUUIDIfRequired();
        FormMapping formMapping = formMappingRepository.getRequiredFormMapping(subject.getSubjectType().getUuid(), null, encounter.getEncounterType().getUuid(), FormType.Encounter);
        if (formMapping == null) {
            throw new Exception(String.format("No form found for the encounter type %s", encounter.getEncounterType().getName()));
        }
        Encounter savedEncounter;

        if (skipRuleExecution()) {
            EncounterHeaders encounterHeaders = new EncounterHeaders(encounter.getEncounterType());
            encounter.setObservations(observationCreator.getObservations(row, encounterHeaders, allErrorMsgs, FormType.Encounter, encounter.getObservations()));
            savedEncounter = encounterService.save(encounter);
        } else {
            UploadRuleServerResponseContract ruleResponse = ruleServerInvoker.getRuleServerResult(row, formMapping.getForm(), encounter, allErrorMsgs);
            encounter.setObservations(observationService.createObservations(ruleResponse.getObservations()));
            decisionCreator.addEncounterDecisions(encounter.getObservations(), ruleResponse.getDecisions());
            decisionCreator.addRegistrationDecisions(subject.getObservations(), ruleResponse.getDecisions());
            savedEncounter = encounterService.save(encounter);
            individualRepository.save(subject);
            visitCreator.saveScheduledVisits(formMapping.getType(), subject.getUuid(), null, ruleResponse.getVisitSchedules(), savedEncounter.getUuid());
        }
        entityApprovalStatusWriter.saveStatus(formMapping, savedEncounter.getId(), EntityApprovalStatus.EntityType.Encounter);
    }

    private Individual getSubject(Row row) throws Exception {
        String subjectExternalId = row.get(EncounterHeaders.subjectId);
        if (subjectExternalId == null || subjectExternalId.isEmpty()) {
            throw new Exception(String.format("'%s' is required", EncounterHeaders.subjectId));
        }
        Individual individual = individualRepository.findByLegacyIdOrUuid(subjectExternalId);
        if (individual == null) {
            throw new Exception(String.format("'%s' '%s' not found in database", EncounterHeaders.subjectId, subjectExternalId));
        }
        return individual;
    }

    private Encounter getOrCreateEncounter(Row row) {
        String id = row.get(EncounterHeaders.id);
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
