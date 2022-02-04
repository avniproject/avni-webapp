package org.avni.importer.batch.csv.writer;

import org.joda.time.LocalDate;
import org.avni.application.FormMapping;
import org.avni.application.FormType;
import org.avni.dao.ProgramEnrolmentRepository;
import org.avni.dao.application.FormMappingRepository;
import org.avni.domain.EntityApprovalStatus;
import org.avni.domain.Individual;
import org.avni.domain.ProgramEnrolment;
import org.avni.importer.batch.csv.creator.*;
import org.avni.importer.batch.csv.writer.header.ProgramEnrolmentHeaders;
import org.avni.importer.batch.model.Row;
import org.avni.service.EntityApprovalStatusService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.batch.item.ItemWriter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;


@Component
public class ProgramEnrolmentWriter implements ItemWriter<Row>, Serializable {

    private final ProgramEnrolmentRepository programEnrolmentRepository;
    private static final ProgramEnrolmentHeaders headers = new ProgramEnrolmentHeaders();
    private ObservationCreator observationCreator;
    private LocationCreator locationCreator;
    private SubjectCreator subjectCreator;
    private DateCreator dateCreator;
    private ProgramCreator programCreator;
    private EntityApprovalStatusService entityApprovalStatusService;
    private FormMappingRepository formMappingRepository;
    private static Logger logger = LoggerFactory.getLogger(ProgramEnrolmentWriter.class);

    @Autowired
    public ProgramEnrolmentWriter(ProgramEnrolmentRepository programEnrolmentRepository,
                                  ObservationCreator observationCreator,
                                  SubjectCreator subjectCreator,
                                  ProgramCreator programCreator,
                                  EntityApprovalStatusService entityApprovalStatusService,
                                  FormMappingRepository formMappingRepository) {
        this.programEnrolmentRepository = programEnrolmentRepository;
        this.observationCreator = observationCreator;
        this.subjectCreator = subjectCreator;
        this.programCreator = programCreator;
        this.entityApprovalStatusService = entityApprovalStatusService;
        this.formMappingRepository = formMappingRepository;
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
        Individual individual = subjectCreator.getSubject(row.get(headers.subjectId), allErrorMsgs, headers.subjectId);
        programEnrolment.setIndividual(individual);
        LocalDate enrolmentDate = dateCreator.getDate(
                row,
                headers.enrolmentDate,
                allErrorMsgs, String.format("%s is mandatory", headers.enrolmentDate)
        );
        if (enrolmentDate != null) programEnrolment.setEnrolmentDateTime(enrolmentDate.toDateTimeAtStartOfDay());
        LocalDate exitDate = dateCreator.getDate(
                row,
                headers.exitDate,
                allErrorMsgs, null
        );
        if (exitDate != null) programEnrolment.setProgramExitDateTime(exitDate.toDateTimeAtStartOfDay());

        programEnrolment.setEnrolmentLocation(locationCreator.getLocation(row, headers.enrolmentLocation, allErrorMsgs));
        programEnrolment.setExitLocation(locationCreator.getLocation(row, headers.exitLocation, allErrorMsgs));
        programEnrolment.setProgram(programCreator.getProgram(row.get(headers.program), allErrorMsgs, headers.program));
        programEnrolment.setObservations(observationCreator.getObservations(row, headers, allErrorMsgs, FormType.ProgramEnrolment, programEnrolment.getObservations()));

        if (allErrorMsgs.size() > 0) {
            throw new Exception(String.join(", ", allErrorMsgs));
        }

        ProgramEnrolment savedEnrolment = programEnrolmentRepository.save(programEnrolment);
        FormMapping formMapping = formMappingRepository.getRequiredFormMapping(individual.getSubjectType().getUuid(), savedEnrolment.getProgram().getUuid(), null, FormType.ProgramEnrolment);
        if (formMapping.isEnableApproval()) {
            entityApprovalStatusService.createDefaultStatus(EntityApprovalStatus.EntityType.ProgramEnrolment, savedEnrolment.getId());
        }
    }

    private ProgramEnrolment getOrCreateProgramEnrolment(Row row) {
        String legacyId = row.get(headers.id);
        ProgramEnrolment existingEnrolment = null;
        if (legacyId != null && !legacyId.isEmpty()) {
            existingEnrolment = programEnrolmentRepository.findByLegacyIdOrUuid(legacyId);
        }
        return existingEnrolment == null ? createNewEnrolment(legacyId) : existingEnrolment;
    }

    private ProgramEnrolment createNewEnrolment(String externalId) {
        ProgramEnrolment programEnrolment = new ProgramEnrolment();
        programEnrolment.setLegacyId(externalId);
        programEnrolment.setVoided(false);
        programEnrolment.assignUUIDIfRequired();
        return programEnrolment;
    }
}
