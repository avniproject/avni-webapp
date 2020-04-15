package org.openchs.importer.batch.csv;

import org.joda.time.DateTime;
import org.openchs.dao.EncounterTypeRepository;
import org.openchs.dao.ProgramEncounterRepository;
import org.openchs.domain.ProgramEncounter;
import org.openchs.importer.batch.csv.creator.*;
import org.openchs.importer.batch.model.Row;
import org.springframework.batch.item.ItemWriter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;


@Component
public class ProgramEncounterWriter implements ItemWriter<Row>, Serializable {

    private final ProgramEncounterRepository programEncounterRepository;
    private static ProgramEncounterFixedHeaders headers = new ProgramEncounterFixedHeaders();
    private final LocationCreator locationCreator;
    private ProgramEnrolmentCreator programEnrolmentCreator;
    private ObservationCreator observationCreator;
    private DateCreator dateCreator;
    private EncounterTypeCreator encounterTypeCreator;


    @Autowired
    public ProgramEncounterWriter(ProgramEncounterRepository programEncounterRepository, EncounterTypeRepository encounterTypeRepository, ProgramEnrolmentCreator programEnrolmentCreator, ObservationCreator observationCreator, EncounterTypeCreator encounterTypeCreator) {
        this.programEncounterRepository = programEncounterRepository;
        this.programEnrolmentCreator = programEnrolmentCreator;
        this.observationCreator = observationCreator;
        this.encounterTypeCreator = encounterTypeCreator;
        this.locationCreator = new LocationCreator();
        this.dateCreator = new DateCreator();
    }

    @Override
    public void write(List<? extends Row> rows) throws Exception {
        for (Row row : rows) write(row);
    }

    private void write(Row row) throws Exception {
        ProgramEncounter programEncounter = getOrCreateProgramEncounter(row);

        List<String> allErrorMsgs = new ArrayList<>();

        programEncounter.setProgramEnrolment(programEnrolmentCreator.getProgramEnrolment(row.get(headers.enrolmentId), allErrorMsgs, headers.enrolmentId));

        programEncounter.setEarliestVisitDateTime(new DateTime(
                dateCreator.getDate(
                        row,
                        headers.earliestVisitDate,
                        allErrorMsgs, null
                )));
        programEncounter.setMaxVisitDateTime(new DateTime(
                dateCreator.getDate(
                        row,
                        headers.maxVisitDate,
                        allErrorMsgs, null
                )));

        programEncounter.setEncounterDateTime(new DateTime(
                dateCreator.getDate(
                        row,
                        headers.visitDate,
                        allErrorMsgs, String.format("%s is mandatory", headers.visitDate
                ))));
        programEncounter.setEncounterLocation(locationCreator.getLocation(row, headers.encounterLocation, allErrorMsgs));
        programEncounter.setCancelLocation(locationCreator.getLocation(row, headers.cancelLocation, allErrorMsgs));
        programEncounter.setEncounterType(encounterTypeCreator.getEncounterType(row.get(headers.encounterType), allErrorMsgs, headers.encounterType));
        programEncounter.setObservations(observationCreator.getObservations(row, headers, allErrorMsgs));

        if (allErrorMsgs.size() > 0) {
            throw new Exception(String.join(", ", allErrorMsgs));
        }

        programEncounterRepository.save(programEncounter);
    }

    private ProgramEncounter getOrCreateProgramEncounter(Row row) {
        String legacyId = row.get(headers.id);
        ProgramEncounter existingEncounter = null;
        if (legacyId != null && !legacyId.isEmpty()) {
            existingEncounter = programEncounterRepository.findByLegacyId(legacyId);
        }
        return existingEncounter == null ? createNewEncounter(legacyId) : existingEncounter;
    }

    private ProgramEncounter createNewEncounter(String externalId) {
        ProgramEncounter programEncounter = new ProgramEncounter();
        programEncounter.setLegacyId(externalId);
        programEncounter.setVoided(false);
        programEncounter.assignUUIDIfRequired();
        return programEncounter;
    }
}
