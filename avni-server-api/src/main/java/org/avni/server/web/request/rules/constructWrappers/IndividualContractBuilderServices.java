package org.avni.server.web.request.rules.constructWrappers;

import org.springframework.stereotype.Service;

@Service
public class IndividualContractBuilderServices {
    private IndividualConstructionService individualConstructionService;
    private ProgramEncounterConstructionService programEncounterConstructionService;

    public IndividualContractBuilderServices(IndividualConstructionService individualConstructionService, ProgramEncounterConstructionService programEncounterConstructionService) {
        this.individualConstructionService = individualConstructionService;
        this.programEncounterConstructionService = programEncounterConstructionService;
    }

    public IndividualConstructionService getIndividualConstructionService() {
        return individualConstructionService;
    }

    public ProgramEncounterConstructionService getProgramEncounterConstructionService() {
        return programEncounterConstructionService;
    }
}
