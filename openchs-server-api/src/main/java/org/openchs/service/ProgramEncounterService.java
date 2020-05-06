package org.openchs.service;

import org.openchs.dao.ProgramEncounterRepository;
import org.openchs.domain.ProgramEncounter;
import org.openchs.web.request.EncounterTypeContract;
import org.openchs.web.request.ProgramEncountersContract;
import org.springframework.stereotype.Service;

@Service
public class ProgramEncounterService {
    private ProgramEncounterRepository programEncounterRepository;
    private IndividualService individualService;

    public ProgramEncounterService(ProgramEncounterRepository programEncounterRepository,IndividualService individualService) {
        this.programEncounterRepository = programEncounterRepository;
        this.individualService = individualService;
    }

    public ProgramEncountersContract getProgramEncounterByUuid(String uuid) {
        ProgramEncounter programEncounter = programEncounterRepository.findByUuid(uuid);
        return constructProgramEncounters(programEncounter);
    }

    public ProgramEncountersContract constructProgramEncounters(ProgramEncounter programEncounter) {
            ProgramEncountersContract programEncountersContract = new ProgramEncountersContract();
            EncounterTypeContract encounterTypeContract = new EncounterTypeContract();
            encounterTypeContract.setName(programEncounter.getEncounterType().getName());
            encounterTypeContract.setUuid(programEncounter.getEncounterType().getUuid());
            encounterTypeContract.setEncounterEligibilityCheckRule(programEncounter.getEncounterType().getEncounterEligibilityCheckRule());
            programEncountersContract.setUuid(programEncounter.getUuid());
            programEncountersContract.setName(programEncounter.getName());
            programEncountersContract.setEncounterType(encounterTypeContract);
            programEncountersContract.setEncounterDateTime(programEncounter.getEncounterDateTime());
            programEncountersContract.setCancelDateTime(programEncounter.getCancelDateTime());
            programEncountersContract.setEarliestVisitDateTime(programEncounter.getEarliestVisitDateTime());
            programEncountersContract.setMaxVisitDateTime(programEncounter.getMaxVisitDateTime());
            programEncountersContract.setVoided(programEncounter.isVoided());
            if(programEncounter.getObservations() != null) {
                programEncountersContract.setObservations(individualService.constructObservations(programEncounter.getObservations()));
            }
            if(programEncounter.getCancelObservations() != null) {
                programEncountersContract.setCancelObservations(individualService.constructObservations(programEncounter.getCancelObservations()));
            }
        return  programEncountersContract;
    }

}