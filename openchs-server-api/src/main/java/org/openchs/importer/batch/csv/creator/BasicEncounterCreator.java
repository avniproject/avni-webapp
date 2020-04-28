package org.openchs.importer.batch.csv.creator;

import org.joda.time.DateTime;
import org.openchs.application.FormType;
import org.openchs.domain.AbstractEncounter;
import org.openchs.importer.batch.csv.writer.header.ProgramEncounterHeaders;
import org.openchs.importer.batch.model.Row;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;


@Component
public class BasicEncounterCreator {

    private static ProgramEncounterHeaders headers = new ProgramEncounterHeaders();
    private final LocationCreator locationCreator;
    private ObservationCreator observationCreator;
    private DateCreator dateCreator;
    private EncounterTypeCreator encounterTypeCreator;


    @Autowired
    public BasicEncounterCreator(ObservationCreator observationCreator,
                                 EncounterTypeCreator encounterTypeCreator) {
        this.observationCreator = observationCreator;
        this.encounterTypeCreator = encounterTypeCreator;
        this.locationCreator = new LocationCreator();
        this.dateCreator = new DateCreator();
    }

    public AbstractEncounter updateEncounter(Row row, AbstractEncounter basicEncounter, List<String> allErrorMsgs, FormType formType) throws Exception {

        basicEncounter.setEarliestVisitDateTime(new DateTime(
                dateCreator.getDate(
                        row,
                        headers.earliestVisitDate,
                        allErrorMsgs, null
                )));
        basicEncounter.setMaxVisitDateTime(new DateTime(
                dateCreator.getDate(
                        row,
                        headers.maxVisitDate,
                        allErrorMsgs, null
                )));

        basicEncounter.setEncounterDateTime(new DateTime(
                dateCreator.getDate(
                        row,
                        headers.visitDate,
                        allErrorMsgs, String.format("%s is mandatory", headers.visitDate
                        ))));
        basicEncounter.setEncounterLocation(locationCreator.getLocation(row, headers.encounterLocation, allErrorMsgs));
        basicEncounter.setCancelLocation(locationCreator.getLocation(row, headers.cancelLocation, allErrorMsgs));
        basicEncounter.setEncounterType(encounterTypeCreator.getEncounterType(row.get(headers.encounterType), allErrorMsgs, headers.encounterType));
        basicEncounter.setObservations(observationCreator.getObservations(row, headers, allErrorMsgs, formType, basicEncounter.getObservations()));

        if (allErrorMsgs.size() > 0) {
            throw new Exception(String.join(", ", allErrorMsgs));
        }

        return basicEncounter;
    }
}
