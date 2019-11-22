package org.openchs.exporter;

import org.joda.time.DateTime;
import org.openchs.domain.AbstractEncounter;
import org.openchs.domain.Individual;
import org.openchs.domain.ProgramEnrolment;
import org.openchs.util.O;
import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.util.Comparator;
import java.util.Set;
import java.util.stream.Stream;

@Component
@StepScope
public class ExportProcessor implements ItemProcessor<Object, ExportItemRow> {

    @Value("#{jobParameters['encounterTypeUUID']}")
    private String encounterTypeUUID;

    @Value("#{jobParameters['startDate']}")
    private String startDate;

    @Value("#{jobParameters['programUUID']}")
    private String programUUID;

    @Value("#{jobParameters['endDate']}")
    private String endDate;

    private DateTime startDateTime;

    private DateTime endDateTime;

    @PostConstruct
    public void init() {
        this.startDateTime = O.getDateTimeDbFormat(startDate);
        this.endDateTime = O.getDateTimeDbFormat(endDate);
    }

    public ExportItemRow process(Object exportItem) {
        ExportItemRow exportItemRow = new ExportItemRow();
        if (programUUID != null) {
            ProgramEnrolment programEnrolment = (ProgramEnrolment) exportItem;
            exportItemRow.setIndividual(programEnrolment.getIndividual());
            exportItemRow.setProgramEnrolment(programEnrolment);
            exportItemRow.setProgramEncounters(getFilteredEncounters(programEnrolment.getProgramEncounters()));
        } else {
            Individual individual = (Individual) exportItem;
            exportItemRow.setIndividual(individual);
            exportItemRow.setEncounters(getFilteredEncounters(individual.getEncounters()));
        }
        return exportItemRow;
    }

    private <T extends AbstractEncounter> Stream<T> getFilteredEncounters(Set<T> programEncounters) {
        return programEncounters.stream()
                .filter(enc -> enc.getEncounterDateTime() != null &&
                        !enc.isVoided() &&
                        enc.getEncounterType().getUuid().equals(encounterTypeUUID) &&
                        enc.getEncounterDateTime().isAfter(startDateTime) &&
                        enc.getEncounterDateTime().isBefore(endDateTime))
                .sorted(Comparator.comparing(AbstractEncounter::getEncounterDateTime));
    }

    public DateTime getStartDateTime() {
        return startDateTime;
    }

    public void setStartDateTime(DateTime startDateTime) {
        this.startDateTime = startDateTime;
    }

    public DateTime getEndDateTime() {
        return endDateTime;
    }
}
