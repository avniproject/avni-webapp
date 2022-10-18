package org.avni.server.web.request.rules.constructWrappers;

import org.springframework.stereotype.Service;

@Service
public class ContractBuilderServices {
    private IndividualConstructionService individualConstructionService;
    private ProgramEncounterConstructionService programEncounterConstructionService;
    private ProgramEnrolmentConstructionService programEnrolmentConstructionService;

    public ContractBuilderServices(IndividualConstructionService individualConstructionService, ProgramEncounterConstructionService programEncounterConstructionService, ProgramEnrolmentConstructionService programEnrolmentConstructionService) {
        this.individualConstructionService = individualConstructionService;
        this.programEncounterConstructionService = programEncounterConstructionService;
        this.programEnrolmentConstructionService = programEnrolmentConstructionService;
    }

    public IndividualConstructionService getIndividualConstructionService() {
        return individualConstructionService;
    }

    public ProgramEncounterConstructionService getProgramEncounterConstructionService() {
        return programEncounterConstructionService;
    }

    public ProgramEnrolmentConstructionService getProgramEnrolmentConstructionService() {
        return programEnrolmentConstructionService;
    }
}
