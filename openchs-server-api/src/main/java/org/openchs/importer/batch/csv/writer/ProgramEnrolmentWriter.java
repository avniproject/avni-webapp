package org.openchs.importer.batch.csv.writer;

import org.joda.time.DateTime;
import org.openchs.dao.ProgramEnrolmentRepository;
import org.openchs.domain.ProgramEnrolment;
import org.openchs.importer.batch.csv.writer.header.ProgramEnrolmentHeaders;
import org.openchs.importer.batch.csv.creator.*;
import org.openchs.importer.batch.model.Row;
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
    private static Logger logger = LoggerFactory.getLogger(ProgramEnrolmentWriter.class);

    @Autowired
    public ProgramEnrolmentWriter(ProgramEnrolmentRepository programEnrolmentRepository,
                                  ObservationCreator observationCreator,
                                  SubjectCreator subjectCreator,
                                  ProgramCreator programCreator) {
        this.programEnrolmentRepository = programEnrolmentRepository;
        this.observationCreator = observationCreator;
        this.subjectCreator = subjectCreator;
        this.programCreator = programCreator;
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

        programEnrolment.setIndividual(subjectCreator.getSubject(row.get(headers.subjectId), allErrorMsgs, headers.subjectId));
        programEnrolment.setEnrolmentDateTime(new DateTime(
                dateCreator.getDate(
                        row,
                        headers.enrolmentDate,
                        allErrorMsgs, String.format("%s is mandatory", headers.enrolmentDate)
                )));
        programEnrolment.setProgramExitDateTime(new DateTime(
                dateCreator.getDate(
                        row,
                        headers.exitDate,
                        allErrorMsgs, null
                )));
        programEnrolment.setEnrolmentLocation(locationCreator.getLocation(row, headers.enrolmentLocation, allErrorMsgs));
        programEnrolment.setExitLocation(locationCreator.getLocation(row, headers.exitLocation, allErrorMsgs));
        programEnrolment.setProgram(programCreator.getProgram(row.get(headers.program), allErrorMsgs, headers.program));
        programEnrolment.setObservations(observationCreator.getObservations(row, headers, allErrorMsgs));

        if (allErrorMsgs.size() > 0) {
            throw new Exception(String.join(", ", allErrorMsgs));
        }

        programEnrolmentRepository.save(programEnrolment);
    }

    private ProgramEnrolment getOrCreateProgramEnrolment(Row row) {
        String legacyId = row.get(headers.id);
        ProgramEnrolment existingEnrolment = null;
        if (legacyId != null && !legacyId.isEmpty()) {
            existingEnrolment = programEnrolmentRepository.findByLegacyId(legacyId);
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
