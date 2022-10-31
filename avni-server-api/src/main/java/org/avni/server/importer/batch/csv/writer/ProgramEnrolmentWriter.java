package org.avni.server.importer.batch.csv.writer;

import org.avni.server.application.FormMapping;
import org.avni.server.application.FormType;
import org.avni.server.dao.ProgramEnrolmentRepository;
import org.avni.server.dao.application.FormMappingRepository;
import org.avni.server.domain.EntityApprovalStatus;
import org.avni.server.domain.Individual;
import org.avni.server.domain.Program;
import org.avni.server.domain.ProgramEnrolment;
import org.avni.server.importer.batch.csv.contract.UploadRuleServerResponseContract;
import org.avni.server.importer.batch.csv.creator.*;
import org.avni.server.importer.batch.csv.writer.header.ProgramEnrolmentHeaders;
import org.avni.server.importer.batch.model.Row;
import org.avni.server.service.ObservationService;
import org.avni.server.service.OrganisationConfigService;
import org.avni.server.service.ProgramEnrolmentService;
import org.joda.time.LocalDate;
import org.springframework.batch.item.ItemWriter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;


@Component
public class ProgramEnrolmentWriter extends EntityWriter implements ItemWriter<Row>, Serializable {
    private final ProgramEnrolmentRepository programEnrolmentRepository;
    private LocationCreator locationCreator;
    private SubjectCreator subjectCreator;
    private DateCreator dateCreator;
    private ProgramCreator programCreator;
    private FormMappingRepository formMappingRepository;
    private ObservationService observationService;
    private RuleServerInvoker ruleServerInvoker;
    private VisitCreator visitCreator;
    private DecisionCreator decisionCreator;
    private ObservationCreator observationCreator;
    private ProgramEnrolmentService programEnrolmentService;
    private EntityApprovalStatusWriter entityApprovalStatusWriter;

    @Autowired
    public ProgramEnrolmentWriter(ProgramEnrolmentRepository programEnrolmentRepository,
                                  SubjectCreator subjectCreator,
                                  ProgramCreator programCreator,
                                  FormMappingRepository formMappingRepository,
                                  ObservationService observationService,
                                  RuleServerInvoker ruleServerInvoker,
                                  VisitCreator visitCreator,
                                  DecisionCreator decisionCreator,
                                  ObservationCreator observationCreator,
                                  ProgramEnrolmentService programEnrolmentService,
                                  EntityApprovalStatusWriter entityApprovalStatusWriter,
                                  OrganisationConfigService organisationConfigService) {
        super(organisationConfigService);
        this.programEnrolmentRepository = programEnrolmentRepository;
        this.subjectCreator = subjectCreator;
        this.programCreator = programCreator;
        this.formMappingRepository = formMappingRepository;
        this.observationService = observationService;
        this.ruleServerInvoker = ruleServerInvoker;
        this.visitCreator = visitCreator;
        this.decisionCreator = decisionCreator;
        this.observationCreator = observationCreator;
        this.programEnrolmentService = programEnrolmentService;
        this.entityApprovalStatusWriter = entityApprovalStatusWriter;
        this.locationCreator = new LocationCreator();
        this.dateCreator = new DateCreator();
    }

    @Override
    public void write(List<? extends Row> rows) throws Exception {
        for (Row row : rows) write(row);
    }

    private void write(Row row) throws Exception {
        ProgramEnrolment programEnrolment = getOrCreateProgramEnrolment(row);

        List<String> allErrorMsgs = new ArrayList<>();
        Individual individual = subjectCreator.getSubject(row.get(ProgramEnrolmentHeaders.subjectId), allErrorMsgs, ProgramEnrolmentHeaders.subjectId);
        programEnrolment.setIndividual(individual);
        Program program = programCreator.getProgram(row.get(ProgramEnrolmentHeaders.programHeader), ProgramEnrolmentHeaders.programHeader);
        LocalDate enrolmentDate = dateCreator.getDate(
                row,
                ProgramEnrolmentHeaders.enrolmentDate,
                allErrorMsgs, String.format("%s is mandatory", ProgramEnrolmentHeaders.enrolmentDate)
        );
        if (enrolmentDate != null) programEnrolment.setEnrolmentDateTime(enrolmentDate.toDateTimeAtStartOfDay());
        LocalDate exitDate = dateCreator.getDate(
                row,
                ProgramEnrolmentHeaders.exitDate,
                allErrorMsgs, null
        );
        if (exitDate != null) programEnrolment.setProgramExitDateTime(exitDate.toDateTimeAtStartOfDay());

        programEnrolment.setEnrolmentLocation(locationCreator.getLocation(row, ProgramEnrolmentHeaders.enrolmentLocation, allErrorMsgs));
        programEnrolment.setExitLocation(locationCreator.getLocation(row, ProgramEnrolmentHeaders.exitLocation, allErrorMsgs));
        programEnrolment.setProgram(program);
        FormMapping formMapping = formMappingRepository.getRequiredFormMapping(individual.getSubjectType().getUuid(), program.getUuid(), null, FormType.ProgramEnrolment);
        if (formMapping == null) {
            throw new Exception(String.format("No form found for the subject type '%s' and program '%s'", individual.getSubjectType().getName(), program.getName()));
        }
        ProgramEnrolment savedEnrolment;
        if (skipRuleExecution()) {
            ProgramEnrolmentHeaders programEnrolmentHeaders = new ProgramEnrolmentHeaders(program);
            programEnrolment.setObservations(observationCreator.getObservations(row, programEnrolmentHeaders, allErrorMsgs, FormType.ProgramEnrolment, programEnrolment.getObservations()));
            savedEnrolment = programEnrolmentService.save(programEnrolment);
        } else {
            UploadRuleServerResponseContract ruleResponse = ruleServerInvoker.getRuleServerResult(row, formMapping.getForm(), programEnrolment, allErrorMsgs);
            programEnrolment.setObservations(observationService.createObservations(ruleResponse.getObservations()));
            decisionCreator.addEnrolmentDecisions(programEnrolment.getObservations(), ruleResponse.getDecisions());
            savedEnrolment = programEnrolmentService.save(programEnrolment);
            visitCreator.saveScheduledVisits(formMapping.getType(), null, savedEnrolment.getUuid(), ruleResponse.getVisitSchedules(), null);
        }
        entityApprovalStatusWriter.saveStatus(formMapping, savedEnrolment.getId(), EntityApprovalStatus.EntityType.ProgramEnrolment);
    }

    private ProgramEnrolment getOrCreateProgramEnrolment(Row row) {
        String id = row.get(ProgramEnrolmentHeaders.id);
        ProgramEnrolment existingEnrolment = null;
        if (id != null && !id.isEmpty()) {
            existingEnrolment = programEnrolmentRepository.findByLegacyIdOrUuid(id);
        }
        return existingEnrolment == null ? createNewEnrolment(id) : existingEnrolment;
    }

    private ProgramEnrolment createNewEnrolment(String externalId) {
        ProgramEnrolment programEnrolment = new ProgramEnrolment();
        programEnrolment.setLegacyId(externalId);
        programEnrolment.setVoided(false);
        programEnrolment.assignUUIDIfRequired();
        return programEnrolment;
    }
}
