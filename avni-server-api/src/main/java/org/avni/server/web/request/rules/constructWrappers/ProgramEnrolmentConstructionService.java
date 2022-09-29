package org.avni.server.web.request.rules.constructWrappers;

import org.avni.server.application.Subject;
import org.avni.server.dao.ChecklistDetailRepository;
import org.avni.server.dao.GroupSubjectRepository;
import org.avni.server.dao.IndividualRepository;
import org.avni.server.domain.*;
import org.avni.server.service.EntityApprovalStatusService;
import org.avni.server.service.ObservationService;
import org.avni.server.web.request.GenderContract;
import org.avni.server.web.request.ObservationModelContract;
import org.avni.server.web.request.SubjectTypeContract;
import org.avni.server.web.request.rules.RulesContractWrapper.*;
import org.avni.server.web.request.rules.request.ProgramEnrolmentRequestEntity;
import org.avni.server.web.request.application.ChecklistDetailRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProgramEnrolmentConstructionService {
    private final ObservationConstructionService observationConstructionService;
    private final IndividualRepository individualRepository;
    private final ObservationService observationService;
    private final ChecklistDetailRepository checklistDetailRepository;
    private final EntityApprovalStatusService entityApprovalStatusService;
    private final GroupSubjectRepository groupSubjectRepository;

    @Autowired
    public ProgramEnrolmentConstructionService(
            ObservationConstructionService observationConstructionService,
            IndividualRepository individualRepository,
            ObservationService observationService,
            ChecklistDetailRepository checklistDetailRepository,
            EntityApprovalStatusService entityApprovalStatusService,
            GroupSubjectRepository groupSubjectRepository) {
        this.observationConstructionService = observationConstructionService;
        this.individualRepository = individualRepository;
        this.observationService = observationService;
        this.checklistDetailRepository = checklistDetailRepository;
        this.entityApprovalStatusService = entityApprovalStatusService;
        this.groupSubjectRepository = groupSubjectRepository;
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

    public ProgramEnrolmentContractWrapper constructProgramEnrolmentContract(ProgramEnrolment programEnrolment) {
        ProgramEnrolmentContractWrapper programEnrolmentContractWrapper = new ProgramEnrolmentContractWrapper();
        programEnrolmentContractWrapper.setEnrolmentDateTime(programEnrolment.getEnrolmentDateTime());
        programEnrolmentContractWrapper.setProgramExitDateTime(programEnrolment.getProgramExitDateTime());
        programEnrolmentContractWrapper.setUuid(programEnrolment.getUuid());
        programEnrolmentContractWrapper.setVoided(programEnrolment.isVoided());
        programEnrolmentContractWrapper.setObservations(observationService.constructObservationModelContracts(programEnrolment.getObservations()));
        programEnrolmentContractWrapper.setExitObservations(observationService.constructObservationModelContracts(programEnrolment.getProgramExitObservations()));
        if (programEnrolment.getIndividual() != null) {
            programEnrolmentContractWrapper.setSubject(getSubjectInfo(programEnrolment.getIndividual()));
        }
        return programEnrolmentContractWrapper;
    }

    public List<ChecklistDetailRequest> constructChecklistDetailRequest() {
        List<ChecklistDetail> checklistDetails = checklistDetailRepository.findAllByIsVoidedFalse();
        return checklistDetails
                .stream().map(ChecklistDetailRequest::fromEntity)
                .collect(Collectors.toList());
    }

    public IndividualContractWrapper getSubjectInfo(Individual individual) {
        IndividualContractWrapper individualContractWrapper = constructBasicSubject(individual);
        if (individualContractWrapper == null) return null;
        EntityApprovalStatusWrapper latestEntityApprovalStatus = entityApprovalStatusService.getLatestEntityApprovalStatus(individual.getId(), EntityApprovalStatus.EntityType.Subject, individual.getUuid());
        individualContractWrapper.setLatestEntityApprovalStatus(latestEntityApprovalStatus);
        List<GroupSubjectContractWrapper> groups = groupSubjectRepository
                .findAllByMemberSubject(individual)
                .stream()
                .map(this::constructGroups)
                .collect(Collectors.toList());
        individualContractWrapper.setGroups(groups);
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

    public IndividualContractWrapper constructBasicSubject(Individual individual) {
        IndividualContractWrapper individualContractWrapper = new IndividualContractWrapper();
        if (individual == null) {
            return null;
        }
        List<ObservationModelContract> observationModelContracts =
                observationService.constructObservationModelContracts(individual.getObservations());
        individualContractWrapper.setObservations(observationModelContracts);
        individualContractWrapper.setUuid(individual.getUuid());
        individualContractWrapper.setFirstName(individual.getFirstName());
        individualContractWrapper.setMiddleName(individual.getMiddleName());
        individualContractWrapper.setLastName(individual.getLastName());
        if (individual.getSubjectType().isAllowProfilePicture()) {
            individualContractWrapper.setProfilePicture(individual.getProfilePicture());
        }
        individualContractWrapper.setDateOfBirth(individual.getDateOfBirth());
        if (individual.getSubjectType().getType().equals(Subject.Person)) {
            individualContractWrapper.setGender(constructGenderContract(individual.getGender()));
        }
        individualContractWrapper.setLowestAddressLevel(constructAddressLevel(individual.getAddressLevel()));
        individualContractWrapper.setRegistrationDate(individual.getRegistrationDate());
        individualContractWrapper.setVoided(individual.isVoided());
        individualContractWrapper.setSubjectType(constructSubjectType(individual.getSubjectType()));
        return individualContractWrapper;
    }

    private GroupSubjectContractWrapper constructGroups(GroupSubject groupSubject){
        GroupSubjectContractWrapper groupSubjectContractWrapper = new GroupSubjectContractWrapper();
        groupSubjectContractWrapper.setUuid(groupSubject.getUuid());
        groupSubjectContractWrapper.setGroupSubject(this.constructBasicSubject(groupSubject.getGroupSubject()));
        groupSubjectContractWrapper.setMemberSubject(this.constructBasicSubject(groupSubject.getMemberSubject()));
        groupSubjectContractWrapper.setGroupRole(GroupRoleContractWrapper.fromGroupRole(groupSubject.getGroupRole()));
        groupSubjectContractWrapper.setMembershipStartDate(groupSubject.getMembershipStartDate());
        groupSubjectContractWrapper.setMembershipEndDate(groupSubject.getMembershipEndDate());
        groupSubjectContractWrapper.setVoided(groupSubject.isVoided());
        return groupSubjectContractWrapper;
    }

    private LowestAddressLevelContract constructAddressLevel(AddressLevel addressLevel) {
        LowestAddressLevelContract lowestAddressLevelContract = new LowestAddressLevelContract();
        if (addressLevel != null) {
            lowestAddressLevelContract.setName(addressLevel.getTitle());
//            lowestAddressLevelContract.setAuditId(addressLevel.getAuditId());
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
