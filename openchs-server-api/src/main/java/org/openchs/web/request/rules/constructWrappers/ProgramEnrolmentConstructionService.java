package org.openchs.web.request.rules.constructWrappers;

import org.openchs.dao.IndividualRepository;
import org.openchs.dao.ProgramEnrolmentRepository;
import org.openchs.domain.*;
import org.openchs.service.ObservationService;
import org.openchs.web.request.*;
import org.openchs.web.request.rules.RulesContractWrapper.IndividualContractWrapper;
import org.openchs.web.request.rules.RulesContractWrapper.LowestAddressLevelContract;
import org.openchs.web.request.rules.RulesContractWrapper.ProgramEnrolmentContractWrapper;
import org.openchs.web.request.rules.request.ObservationRequestEntity;
import org.openchs.web.request.rules.request.ProgramEnrolmentRequestEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ProgramEnrolmentConstructionService {
    private final ObservationConstructionService observationConstructionService;
    private final IndividualRepository individualRepository;
    private final ProgramEnrolmentRepository programEnrolmentRepository;
    private final ObservationService observationService;

    @Autowired
    public ProgramEnrolmentConstructionService(
            ObservationConstructionService observationConstructionService,
            IndividualRepository individualRepository,
            ProgramEnrolmentRepository programEnrolmentRepository,
            ObservationService observationService) {
        this.observationConstructionService = observationConstructionService;
        this.individualRepository = individualRepository;
        this.programEnrolmentRepository = programEnrolmentRepository;
        this.observationService = observationService;
    }


    public ProgramEnrolmentContractWrapper constructProgramEnrolmentContract(ProgramEnrolmentRequestEntity request) {
        ProgramEnrolmentContractWrapper programEnrolmentContractWrapper = new ProgramEnrolmentContractWrapper();
        programEnrolmentContractWrapper.setEnrolmentDateTime(request.getEnrolmentDateTime());
        programEnrolmentContractWrapper.setProgramExitDateTime(request.getProgramExitDateTime());
        programEnrolmentContractWrapper.setUuid(request.getUuid());
        programEnrolmentContractWrapper.setVoided(request.isVoided());
        if(request.getObservations() != null){
            programEnrolmentContractWrapper.setObservations(request.getObservations().stream().map( x -> observationConstructionService.constructObservation(x)).collect(Collectors.toList()));
        }
        if(request.getProgramExitObservations() != null){
            programEnrolmentContractWrapper.setExitObservations(request.getProgramExitObservations().stream().map( x -> observationConstructionService.constructObservation(x)).collect(Collectors.toList()));
        }
        if(request.getIndividualUUID() != null) {
            programEnrolmentContractWrapper.setSubject(getSubjectInfo(individualRepository.findByUuid(request.getIndividualUUID())));
        }
        ProgramEnrolment programEnrolment = programEnrolmentRepository.findByUuid(request.getUuid());
        Set<ProgramEncountersContract> encountersContractList = constructEncounters(programEnrolment.getProgramEncounters());
        programEnrolmentContractWrapper.setProgramEncounters(encountersContractList);
        return programEnrolmentContractWrapper;
    }

    public Set<ProgramEncountersContract> constructEncounters(Set<ProgramEncounter> encounters) {
        return encounters.stream().map(encounter -> {
            ProgramEncountersContract encountersContract = new ProgramEncountersContract();
            EncounterTypeContract encounterTypeContract = new EncounterTypeContract();
            encounterTypeContract.setName(encounter.getEncounterType().getOperationalEncounterTypeName());
            encountersContract.setUuid(encounter.getUuid());
            encountersContract.setName(encounter.getName());
            encountersContract.setEncounterType(encounterTypeContract);
            encountersContract.setEncounterDateTime(encounter.getEncounterDateTime());
            encountersContract.setEarliestVisitDateTime(encounter.getEarliestVisitDateTime());
            encountersContract.setMaxVisitDateTime(encounter.getMaxVisitDateTime());
            encountersContract.setVoided(encounter.isVoided());
            return encountersContract;
        }).collect(Collectors.toSet());
    }

    public IndividualContractWrapper getSubjectInfo(Individual individual) {
        IndividualContractWrapper individualContractWrapper = new IndividualContractWrapper();
        if (individual == null)  {
            return null;
        }
        List<ObservationContract> observationContracts = observationService.constructObservations(individual.getObservations());
        List<ObservationModelContract> observationModelContracts = observationContracts.stream()
                .map(observationConstructionService::constructObservation)
                .collect(Collectors.toList());
        individualContractWrapper.setObservations(observationModelContracts);
        individualContractWrapper.setUuid(individual.getUuid());
        individualContractWrapper.setFirstName(individual.getFirstName());
        individualContractWrapper.setLastName(individual.getLastName());
        individualContractWrapper.setDateOfBirth(individual.getDateOfBirth());
        individualContractWrapper.setGender(constructGenderContract(individual.getGender()));
        individualContractWrapper.setLowestAddressLevel(constructAddressLevel(individual.getAddressLevel()));
        individualContractWrapper.setRegistrationDate(individual.getRegistrationDate());
        individualContractWrapper.setVoided(individual.isVoided());
        individualContractWrapper.setSubjectType(constructSubjectType(individual.getSubjectType()));
        return individualContractWrapper;
    }

    private LowestAddressLevelContract constructAddressLevel(AddressLevel addressLevel) {
        LowestAddressLevelContract lowestAddressLevelContract = new LowestAddressLevelContract();
        lowestAddressLevelContract.setName(addressLevel.getTitle());
        lowestAddressLevelContract.setAuditId(addressLevel.getAuditId());
        lowestAddressLevelContract.setUuid(addressLevel.getUuid());
        lowestAddressLevelContract.setVersion(addressLevel.getVersion());
        lowestAddressLevelContract.setOrganisationId(addressLevel.getOrganisationId());
        lowestAddressLevelContract.setTitle(addressLevel.getTitle());
        lowestAddressLevelContract.setLevel(addressLevel.getLevel());
        lowestAddressLevelContract.setParentId(addressLevel.getParentId());
        return lowestAddressLevelContract;
    }

    private SubjectTypeContract constructSubjectType(SubjectType subjectType ) {
        SubjectTypeContract subjectTypeContract = new SubjectTypeContract();
        subjectTypeContract.setName(subjectType.getName());
        subjectTypeContract.setUuid(subjectType.getUuid());
        return subjectTypeContract;
    }

    private GenderContract constructGenderContract(Gender gender) {
        GenderContract genderContract = new GenderContract(gender.getUuid(),gender.getName());
        return genderContract;
    }
}
