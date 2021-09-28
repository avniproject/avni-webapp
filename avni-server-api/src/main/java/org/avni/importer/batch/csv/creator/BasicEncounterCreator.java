package org.avni.importer.batch.csv.creator;

import org.joda.time.LocalDate;
import org.avni.application.FormType;
import org.avni.domain.AbstractEncounter;
import org.avni.importer.batch.csv.writer.header.ProgramEncounterHeaders;
import org.avni.importer.batch.model.Row;
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

        LocalDate earliestVisitDate = dateCreator.getDate(
                row,
                headers.earliestVisitDate,
                allErrorMsgs, null
        );
        if (earliestVisitDate != null)
            basicEncounter.setEarliestVisitDateTime(earliestVisitDate.toDateTimeAtStartOfDay());

        LocalDate maxVisitDate = dateCreator.getDate(
                row,
                headers.maxVisitDate,
                allErrorMsgs, null
        );
        if (maxVisitDate != null) basicEncounter.setMaxVisitDateTime(maxVisitDate.toDateTimeAtStartOfDay());

        LocalDate visitDate = dateCreator.getDate(
                row,
                headers.visitDate,
                allErrorMsgs, String.format("%s is mandatory", headers.visitDate
                ));
        if (visitDate != null) basicEncounter.setEncounterDateTime(visitDate.toDateTimeAtStartOfDay());

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
