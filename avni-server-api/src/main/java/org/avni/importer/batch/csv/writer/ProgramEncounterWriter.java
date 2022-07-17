package org.avni.importer.batch.csv.writer;

import org.avni.application.FormMapping;
import org.avni.application.FormType;
import org.avni.dao.ProgramEncounterRepository;
import org.avni.dao.ProgramEnrolmentRepository;
import org.avni.dao.application.FormMappingRepository;
import org.avni.domain.EntityApprovalStatus;
import org.avni.domain.ProgramEncounter;
import org.avni.domain.ProgramEnrolment;
import org.avni.domain.SubjectType;
import org.avni.importer.batch.csv.contract.UploadRuleServerResponseContract;
import org.avni.importer.batch.csv.creator.*;
import org.avni.importer.batch.csv.writer.header.ProgramEncounterHeaders;
import org.avni.importer.batch.model.Row;
import org.avni.service.ObservationService;
import org.avni.service.OrganisationConfigService;
import org.avni.service.ProgramEncounterService;
import org.springframework.batch.item.ItemWriter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;


@Component
public class ProgramEncounterWriter extends EntityWriter implements ItemWriter<Row>, Serializable {

    private static ProgramEncounterHeaders headers = new ProgramEncounterHeaders();
    private final ProgramEncounterRepository programEncounterRepository;
    private ProgramEnrolmentCreator programEnrolmentCreator;
    private BasicEncounterCreator basicEncounterCreator;
    private FormMappingRepository formMappingRepository;
    private RuleServerInvoker ruleServerInvoker;
    private ObservationService observationService;
    private VisitCreator visitCreator;
    private DecisionCreator decisionCreator;
    private ProgramEnrolmentRepository programEnrolmentRepository;
    private ObservationCreator observationCreator;
    private ProgramEncounterService programEncounterService;
    private EntityApprovalStatusWriter entityApprovalStatusWriter;

    @Autowired
    public ProgramEncounterWriter(ProgramEncounterRepository programEncounterRepository,
                                  ProgramEnrolmentCreator programEnrolmentCreator,
                                  BasicEncounterCreator basicEncounterCreator,
                                  FormMappingRepository formMappingRepository,
                                  RuleServerInvoker ruleServerInvoker,
                                  ObservationService observationService,
                                  VisitCreator visitCreator,
                                  DecisionCreator decisionCreator,
                                  ProgramEnrolmentRepository programEnrolmentRepository,
                                  ObservationCreator observationCreator,
                                  ProgramEncounterService programEncounterService,
                                  EntityApprovalStatusWriter entityApprovalStatusWriter,
                                  OrganisationConfigService organisationConfigService) {
        super(organisationConfigService);
        this.programEncounterRepository = programEncounterRepository;
        this.programEnrolmentCreator = programEnrolmentCreator;
        this.basicEncounterCreator = basicEncounterCreator;
        this.formMappingRepository = formMappingRepository;
        this.ruleServerInvoker = ruleServerInvoker;
        this.observationService = observationService;
        this.visitCreator = visitCreator;
        this.decisionCreator = decisionCreator;
        this.programEnrolmentRepository = programEnrolmentRepository;
        this.observationCreator = observationCreator;
        this.programEncounterService = programEncounterService;
        this.entityApprovalStatusWriter = entityApprovalStatusWriter;
    }

    @Override
    public void write(List<? extends Row> rows) throws Exception {
        for (Row row : rows) write(row);
    }

    private void write(Row row) throws Exception {
        ProgramEncounter programEncounter = getOrCreateProgramEncounter(row);
        List<String> allErrorMsgs = new ArrayList<>();
        ProgramEnrolment programEnrolment = programEnrolmentCreator.getProgramEnrolment(row.get(headers.enrolmentId), headers.enrolmentId);
        SubjectType subjectType = programEnrolment.getIndividual().getSubjectType();
        programEncounter.setProgramEnrolment(programEnrolment);
        basicEncounterCreator.updateEncounter(row, programEncounter, allErrorMsgs);

        FormMapping formMapping = formMappingRepository.getRequiredFormMapping(subjectType.getUuid(), programEnrolment.getProgram().getUuid(), programEncounter.getEncounterType().getUuid(), FormType.ProgramEncounter);
        if (formMapping == null) {
            throw new Exception(String.format("No form found for the encounter type %s", programEncounter.getEncounterType().getName()));
        }
        ProgramEncounter savedEncounter;
        if (skipRuleExecution()) {
            programEncounter.setObservations(observationCreator.getObservations(row, headers, allErrorMsgs, FormType.ProgramEncounter, programEncounter.getObservations()));
            savedEncounter = programEncounterService.save(programEncounter);
        } else {
            UploadRuleServerResponseContract ruleResponse = ruleServerInvoker.getRuleServerResult(row, formMapping.getForm(), programEncounter, allErrorMsgs);
            programEncounter.setObservations(observationService.createObservations(ruleResponse.getObservations()));
            decisionCreator.addEncounterDecisions(programEncounter.getObservations(), ruleResponse.getDecisions());
            decisionCreator.addEnrolmentDecisions(programEnrolment.getObservations(), ruleResponse.getDecisions());
            savedEncounter = programEncounterService.save(programEncounter);
            programEnrolmentRepository.save(programEnrolment);
            visitCreator.saveScheduledVisits(formMapping.getType(), null, programEnrolment.getUuid(), ruleResponse.getVisitSchedules(), savedEncounter.getUuid());
        }
        entityApprovalStatusWriter.saveStatus(formMapping, savedEncounter, EntityApprovalStatus.EntityType.ProgramEncounter);
    }

    private ProgramEncounter getOrCreateProgramEncounter(Row row) {
        String id = row.get(headers.id);
        ProgramEncounter existingEncounter = null;
        if (id != null && !id.isEmpty()) {
            existingEncounter = programEncounterRepository.findByLegacyIdOrUuid(id);
        }
        return existingEncounter == null ? createNewEncounter(id) : existingEncounter;
    }

    private ProgramEncounter createNewEncounter(String externalId) {
        ProgramEncounter programEncounter = new ProgramEncounter();
        programEncounter.setLegacyId(externalId);
        programEncounter.setVoided(false);
        programEncounter.assignUUIDIfRequired();
        return programEncounter;
    }
}
