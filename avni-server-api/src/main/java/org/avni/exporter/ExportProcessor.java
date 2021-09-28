package org.avni.exporter;

import org.joda.time.DateTime;
import org.avni.domain.*;
import org.avni.web.request.ReportType;
import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.util.Date;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Stream;

import static java.lang.String.format;

@Component
@StepScope
public class ExportProcessor implements ItemProcessor<Object, ExportItemRow> {

    @Value("#{jobParameters['encounterTypeUUID']}")
    private String encounterTypeUUID;

    @Value("#{jobParameters['startDate']}")
    private Date startDate;

    @Value("#{jobParameters['programUUID']}")
    private String programUUID;

    @Value("#{jobParameters['reportType']}")
    private String reportType;

    @Value("#{jobParameters['endDate']}")
    private Date endDate;

    private DateTime startDateTime;

    private DateTime endDateTime;

    @PostConstruct
    public void init() {
        this.startDateTime = new DateTime(startDate);
        this.endDateTime = new DateTime(endDate);
    }

    public ExportItemRow process(Object exportItem) {
        ExportItemRow exportItemRow = new ExportItemRow();
        switch (ReportType.valueOf(reportType)) {
            case Registration: {
                Individual individual = (Individual) exportItem;
                exportItemRow.setIndividual(individual);
                break;
            }
            case Enrolment: {
                ProgramEnrolment programEnrolment = (ProgramEnrolment) exportItem;
                exportItemRow.setIndividual(programEnrolment.getIndividual());
                exportItemRow.setProgramEnrolment(programEnrolment);
                break;
            }
            case Encounter: {
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
                break;
            }
            case GroupSubject: {
                GroupSubject groupSubject = (GroupSubject) exportItem;
                exportItemRow.setGroupSubject(groupSubject);
                break;
            }
        }
        return exportItemRow;
    }

    private <T extends AbstractEncounter> Stream<T> getFilteredEncounters(Set<T> programEncounters) {
        return programEncounters.stream()
                .filter(enc -> !enc.isVoided() &&
                        enc.getEncounterType().getUuid().equals(encounterTypeUUID) &&
                        enc.isEncounteredOrCancelledBetween(startDateTime, endDateTime))
                .sorted((enc1, enc2) -> {
                    DateTime t1 = Optional.ofNullable(enc1.getEncounterDateTime()).orElse(enc1.getCancelDateTime());
                    DateTime t2 = Optional.ofNullable(enc2.getEncounterDateTime()).orElse(enc2.getCancelDateTime());
                    return t1.compareTo(t2);
                });
    }
}
