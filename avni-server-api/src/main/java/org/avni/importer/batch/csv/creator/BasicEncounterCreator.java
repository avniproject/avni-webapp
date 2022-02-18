package org.avni.importer.batch.csv.creator;

import org.avni.domain.AbstractEncounter;
import org.avni.domain.EncounterType;
import org.avni.importer.batch.csv.writer.header.CommonEncounterHeaders;
import org.avni.importer.batch.model.Row;
import org.joda.time.LocalDate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;


@Component
public class BasicEncounterCreator {

    private static CommonEncounterHeaders headers = new CommonEncounterHeaders();
    private final LocationCreator locationCreator;
    private DateCreator dateCreator;
    private EncounterTypeCreator encounterTypeCreator;

    @Autowired
    public BasicEncounterCreator(EncounterTypeCreator encounterTypeCreator) {
        this.encounterTypeCreator = encounterTypeCreator;
        this.locationCreator = new LocationCreator();
        this.dateCreator = new DateCreator();
    }

    public AbstractEncounter updateEncounter(Row row, AbstractEncounter basicEncounter, List<String> allErrorMsgs) throws Exception {

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
        EncounterType encounterType = encounterTypeCreator.getEncounterType(row.get(headers.encounterType), headers.encounterType);
        basicEncounter.setEncounterType(encounterType);
        return basicEncounter;
    }
}
