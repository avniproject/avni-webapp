package org.openchs.importer.batch.csv.writer;

import org.openchs.dao.EncounterTypeRepository;
import org.openchs.dao.ProgramEncounterRepository;
import org.openchs.domain.ProgramEncounter;
import org.openchs.importer.batch.csv.writer.header.ProgramEncounterHeaders;
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
    private static ProgramEncounterHeaders headers = new ProgramEncounterHeaders();
    private ProgramEnrolmentCreator programEnrolmentCreator;
    private BasicEncounterCreator basicEncounterCreator;


    @Autowired
    public ProgramEncounterWriter(ProgramEncounterRepository programEncounterRepository, EncounterTypeRepository encounterTypeRepository, ProgramEnrolmentCreator programEnrolmentCreator, ObservationCreator observationCreator, EncounterTypeCreator encounterTypeCreator, BasicEncounterCreator basicEncounterCreator) {
        this.programEncounterRepository = programEncounterRepository;
        this.programEnrolmentCreator = programEnrolmentCreator;
        this.basicEncounterCreator = basicEncounterCreator;
    }

    @Override
    public void write(List<? extends Row> rows) throws Exception {
        for (Row row : rows) write(row);
    }

    private void write(Row row) throws Exception {
        ProgramEncounter programEncounter = getOrCreateProgramEncounter(row);
        List<String> allErrorMsgs = new ArrayList<>();
        basicEncounterCreator.updateEncounter(row, programEncounter, allErrorMsgs);

        programEncounter.setProgramEnrolment(programEnrolmentCreator.getProgramEnrolment(row.get(headers.enrolmentId), allErrorMsgs, headers.enrolmentId));

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
