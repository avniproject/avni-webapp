package org.openchs.web.request.rules.constructWrappers;

import org.openchs.application.Subject;
import org.openchs.dao.ChecklistDetailRepository;
import org.openchs.dao.IndividualRepository;
import org.openchs.dao.ProgramEnrolmentRepository;
import org.openchs.domain.*;
import org.openchs.service.EntityApprovalStatusService;
import org.openchs.service.ObservationService;
import org.openchs.web.request.*;
import org.openchs.web.request.application.ChecklistDetailRequest;
import org.openchs.web.request.rules.RulesContractWrapper.*;
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
    private final ChecklistDetailRepository checklistDetailRepository;
    private final EntityApprovalStatusService entityApprovalStatusService;

    @Autowired
    public ProgramEnrolmentConstructionService(
            ObservationConstructionService observationConstructionService,
            IndividualRepository individualRepository,
            ProgramEnrolmentRepository programEnrolmentRepository,
            ObservationService observationService,
            ChecklistDetailRepository checklistDetailRepository,
            EntityApprovalStatusService entityApprovalStatusService) {
        this.observationConstructionService = observationConstructionService;
        this.individualRepository = individualRepository;
        this.programEnrolmentRepository = programEnrolmentRepository;
        this.observationService = observationService;
        this.checklistDetailRepository = checklistDetailRepository;
        this.entityApprovalStatusService = entityApprovalStatusService;
    }


    public ProgramEnrolmentContractWrapper constructProgramEnrolmentContract(ProgramEnrolmentRequestEntity request) {
        ProgramEnrolmentContractWrapper programEnrolmentContractWrapper = new ProgramEnrolmentContractWrapper();
        programEnrolmentContractWrapper.setEnrolmentDateTime(request.getEnrolmentDateTime());
        programEnrolmentContractWrapper.setProgramExitDateTime(request.getProgramExitDateTime());
        programEnrolmentContractWrapper.setUuid(request.getUuid());
        programEnrolmentContractWrapper.setVoided(request.isVoided());
        if (request.getObservations() != null) {
            programEnrolmentContractWrapper.setObservations(request.getObservations().stream().map(x -> observationConstructionService.constructObservation(x)).collect(Collectors.toList()));
        }
        if (request.getProgramExitObservations() != null) {
            programEnrolmentContractWrapper.setExitObservations(request.getProgramExitObservations().stream().map(x -> observationConstructionService.constructObservation(x)).collect(Collectors.toList()));
        }
        if (request.getIndividualUUID() != null) {
            programEnrolmentContractWrapper.setSubject(getSubjectInfo(individualRepository.findByUuid(request.getIndividualUUID())));
        }
//        ProgramEnrolment programEnrolment = programEnrolmentRepository.findByUuid(request.getUuid());
//        Set<ProgramEncountersContract> encountersContractList = constructEncounters(programEnrolment.getProgramEncounters());
//        programEnrolmentContractWrapper.setProgramEncounters(encountersContractList);
        return programEnrolmentContractWrapper;
    }

    public List<ChecklistDetailRequest> constructChecklistDetailRequest() {
        List<ChecklistDetail> checklistDetails = checklistDetailRepository.findAllByIsVoidedFalse();
        return checklistDetails
                .stream().map(ChecklistDetailRequest::fromEntity)
                .collect(Collectors.toList());
    }

    public IndividualContractWrapper getSubjectInfo(Individual individual) {
        IndividualContractWrapper individualContractWrapper = new IndividualContractWrapper();
        if (individual == null) {
            return null;
        }
        List<ObservationModelContract> observationModelContracts =
                observationService.constructObservationModelContracts(individual.getObservations());
        individualContractWrapper.setObservations(observationModelContracts);
        individualContractWrapper.setUuid(individual.getUuid());
        individualContractWrapper.setFirstName(individual.getFirstName());
        individualContractWrapper.setLastName(individual.getLastName());
        individualContractWrapper.setDateOfBirth(individual.getDateOfBirth());
        if (individual.getSubjectType().getType().equals(Subject.Person)) {
            individualContractWrapper.setGender(constructGenderContract(individual.getGender()));
        }
        individualContractWrapper.setLowestAddressLevel(constructAddressLevel(individual.getAddressLevel()));
        individualContractWrapper.setRegistrationDate(individual.getRegistrationDate());
        individualContractWrapper.setVoided(individual.isVoided());
        individualContractWrapper.setSubjectType(constructSubjectType(individual.getSubjectType()));
        EntityApprovalStatusWrapper latestEntityApprovalStatus = entityApprovalStatusService.getLatestEntityApprovalStatus(individual.getId(), EntityApprovalStatus.EntityType.Subject, individual.getUuid());
        individualContractWrapper.setLatestEntityApprovalStatus(latestEntityApprovalStatus);
        individualContractWrapper.setEncounters(individual
                .getEncounters()
                .stream()
                .map(enc -> EncounterContractWrapper.fromEncounter(enc, observationService, entityApprovalStatusService))
                .collect(Collectors.toList())
        );
        individualContractWrapper.setEnrolments(individual
                .getProgramEnrolments()
                .stream()
                .map(enl -> ProgramEnrolmentContractWrapper.fromEnrolment(enl, observationService, entityApprovalStatusService))
                .collect(Collectors.toList())
        );
        return individualContractWrapper;
    }

    private LowestAddressLevelContract constructAddressLevel(AddressLevel addressLevel) {
        LowestAddressLevelContract lowestAddressLevelContract = new LowestAddressLevelContract();
        if (addressLevel != null) {
            lowestAddressLevelContract.setName(addressLevel.getTitle());
            lowestAddressLevelContract.setAuditId(addressLevel.getAuditId());
            lowestAddressLevelContract.setUuid(addressLevel.getUuid());
            lowestAddressLevelContract.setVersion(addressLevel.getVersion());
            lowestAddressLevelContract.setOrganisationId(addressLevel.getOrganisationId());
            lowestAddressLevelContract.setTitle(addressLevel.getTitle());
            lowestAddressLevelContract.setLevel(addressLevel.getLevel());
            lowestAddressLevelContract.setParentId(addressLevel.getParentId());
        }
        return lowestAddressLevelContract;
    }

    private SubjectTypeContract constructSubjectType(SubjectType subjectType) {
        SubjectTypeContract subjectTypeContract = new SubjectTypeContract();
        subjectTypeContract.setName(subjectType.getName());
        subjectTypeContract.setUuid(subjectType.getUuid());
        subjectTypeContract.setType(subjectType.getType().toString());
        return subjectTypeContract;
    }

    private GenderContract constructGenderContract(Gender gender) {
        GenderContract genderContract = new GenderContract(gender.getUuid(), gender.getName());
        return genderContract;
    }
}
