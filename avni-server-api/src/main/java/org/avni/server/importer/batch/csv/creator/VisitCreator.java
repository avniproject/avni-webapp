package org.avni.server.importer.batch.csv.creator;

import org.avni.server.application.FormType;
import org.avni.server.service.EncounterService;
import org.avni.server.service.ProgramEncounterService;
import org.avni.server.web.request.rules.RulesContractWrapper.VisitSchedule;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class VisitCreator {

    private ProgramEncounterService programEncounterService;
    private EncounterService encounterService;

    @Autowired
    public VisitCreator(ProgramEncounterService programEncounterService, EncounterService encounterService) {
        this.programEncounterService = programEncounterService;
        this.encounterService = encounterService;
    }

    public void saveScheduledVisits(FormType formType,
                                    String subjectUuid,
                                    String programEnrolmentUuid,
                                    List<VisitSchedule> visitSchedules,
                                    String currentEncounterUuid) {
        if (visitSchedules == null || visitSchedules.size() == 0) return;
        switch (formType) {
            case Encounter:
            case IndividualProfile: {
                encounterService.saveVisitSchedules(subjectUuid, visitSchedules, currentEncounterUuid);
                break;
            }
            case ProgramEnrolment:
            case ProgramEncounter: {
                programEncounterService.saveVisitSchedules(programEnrolmentUuid, visitSchedules, currentEncounterUuid);
                break;
            }
        }
    }
}
