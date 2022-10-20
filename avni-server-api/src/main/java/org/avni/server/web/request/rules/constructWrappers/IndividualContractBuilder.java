package org.avni.server.web.request.rules.constructWrappers;

import org.avni.server.domain.Individual;
import org.avni.server.service.IndividualService;
import org.avni.server.web.request.rules.RulesContractWrapper.IndividualContract;
import org.avni.server.web.request.rules.request.IndividualRequestEntity;
import org.springframework.beans.factory.annotation.Autowired;

public class IndividualContractBuilder {
    private IndividualContractBuilderServices services;
    private IndividualService individualService;

    @Autowired
    public IndividualContractBuilder(IndividualContractBuilderServices services, IndividualService individualService) {
        this.services = services;
        this.individualService = individualService;
    }

    public IndividualContract build(IndividualRequestEntity individualRequestEntity) {
        Individual individual = individualService.findByUuid(individualRequestEntity.getUuid());
        IndividualContract individualContract = services.getIndividualConstructionService().constructIndividualContract(individualRequestEntity, individual);
        if (individual != null) {
            individualContract.setEncounters(services.getProgramEncounterConstructionService().mapEncounters(individual.getEncounters()));
            individualContract.setEnrolments(services.getProgramEncounterConstructionService().mapEnrolments(individual.getProgramEnrolments()));
        }
        return individualContract;
    }
}
