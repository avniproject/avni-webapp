package org.avni.server.web.request.rules.constructWrappers;

import org.avni.server.application.Subject;
import org.avni.server.dao.*;
import org.avni.server.domain.*;
import org.avni.server.service.EntityApprovalStatusService;
import org.avni.server.service.ObservationService;
import org.avni.server.web.request.ObservationModelContract;
import org.avni.server.web.request.rules.RulesContractWrapper.*;
import org.avni.server.web.request.rules.request.IndividualRequestEntity;
import org.avni.server.web.request.GenderContract;
import org.avni.server.web.request.SubjectTypeContract;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class IndividualConstructionService {
    private final Logger logger;
    private final GenderRepository genderRepository;
    private final SubjectTypeRepository subjectTypeRepository;
    private final LocationRepository locationRepository;
    private final ObservationConstructionService observationConstructionService;
    private EntityApprovalStatusService entityApprovalStatusService;
    private GroupSubjectRepository groupSubjectRepository;
    private ObservationService observationService;

    @Autowired
    public IndividualConstructionService(
            GenderRepository genderRepository,
            SubjectTypeRepository subjectTypeRepository,
            LocationRepository locationRepository,
            ObservationConstructionService observationConstructionService,
            EntityApprovalStatusService entityApprovalStatusService, GroupSubjectRepository groupSubjectRepository, ObservationService observationService) {
        this.entityApprovalStatusService = entityApprovalStatusService;
        this.groupSubjectRepository = groupSubjectRepository;
        this.observationService = observationService;
        logger = LoggerFactory.getLogger(this.getClass());
        this.genderRepository = genderRepository;
        this.subjectTypeRepository = subjectTypeRepository;
        this.locationRepository = locationRepository;
        this.observationConstructionService = observationConstructionService;
    }

    public IndividualContract getSubjectInfo(Individual individual) {
        IndividualContract individualContractWrapper = constructBasicSubject(individual);
        if (individualContractWrapper == null) return null;
        EntityApprovalStatusWrapper latestEntityApprovalStatus = entityApprovalStatusService.getLatestEntityApprovalStatus(individual.getId(), EntityApprovalStatus.EntityType.Subject, individual.getUuid());
        individualContractWrapper.setLatestEntityApprovalStatus(latestEntityApprovalStatus);
        List<GroupSubjectContract> groups = groupSubjectRepository
                .findAllByMemberSubject(individual)
                .stream()
                .map(this::constructGroups)
                .collect(Collectors.toList());
        individualContractWrapper.setGroups(groups);
        individualContractWrapper.setEncounters(individual
                .getEncounters()
                .stream()
                .map(enc -> EncounterContract.fromEncounter(enc, observationService, entityApprovalStatusService))
                .collect(Collectors.toList())
        );
        individualContractWrapper.setEnrolments(individual
                .getProgramEnrolments()
                .stream()
                .map(enl -> ProgramEnrolmentContract.fromEnrolment(enl, observationService, entityApprovalStatusService))
                .collect(Collectors.toList())
        );
        return individualContractWrapper;
    }

    public IndividualContract constructBasicSubject(Individual individual) {
        IndividualContract individualContractWrapper = new IndividualContract();
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
    public IndividualContract constructIndividualContract(IndividualRequestEntity individualRequestEntity, Individual individual){
        IndividualContract individualContract = new IndividualContract();
        individualContract.setUuid(individualRequestEntity.getUuid());
        individualContract.setFirstName(individualRequestEntity.getFirstName());
        individualContract.setLastName(individualRequestEntity.getLastName());
        if(individual != null && individual.getSubjectType().isAllowProfilePicture()) {
            individualContract.setProfilePicture(individualRequestEntity.getProfilePicture());
        }
        individualContract.setRegistrationDate(individualRequestEntity.getRegistrationDate());
        individualContract.setDateOfBirth(individualRequestEntity.getDateOfBirth());
        if(individualRequestEntity.getGenderUUID() != null){
            individualContract.setGender(constructGenderContract(individualRequestEntity.getGenderUUID()));
        }
        if(individualRequestEntity.getSubjectTypeUUID() != null){
            individualContract.setSubjectType(constructSubjectType(individualRequestEntity.getSubjectTypeUUID()));
        }
        if(individualRequestEntity.getAddressLevelUUID() != null){
            individualContract.setLowestAddressLevel(constructAddressLevel(individualRequestEntity.getAddressLevelUUID()));
        }
        if(individualRequestEntity.getObservations() != null){
            individualContract.setObservations(individualRequestEntity.getObservations().stream().map( x -> observationConstructionService.constructObservation(x)).collect(Collectors.toList()));
        }
        return individualContract;
    }

    private SubjectTypeContract constructSubjectType(String subjectUUid) {
        SubjectType subjectType = subjectTypeRepository.findByUuid(subjectUUid);
        SubjectTypeContract subjectTypeContract = new SubjectTypeContract();
        subjectTypeContract.setName(subjectType.getName());
        subjectTypeContract.setUuid(subjectType.getUuid());
        subjectTypeContract.setType(subjectType.getType().toString());
        return subjectTypeContract;
    }

    private LowestAddressLevelContract constructAddressLevel(String addressUuid) {
        AddressLevel addressLevel = locationRepository.findByUuid(addressUuid);
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

    private GenderContract constructGenderContract(String genderUuid) {
        Gender gender = genderRepository.findByUuid(genderUuid);
        GenderContract genderContract = new GenderContract(gender.getUuid(),gender.getName());
        return genderContract;
    }


    private GroupSubjectContract constructGroups(GroupSubject groupSubject){
        GroupSubjectContract groupSubjectContract = new GroupSubjectContract();
        groupSubjectContract.setUuid(groupSubject.getUuid());
        groupSubjectContract.setGroupSubject(this.constructBasicSubject(groupSubject.getGroupSubject()));
        groupSubjectContract.setMemberSubject(this.constructBasicSubject(groupSubject.getMemberSubject()));
        groupSubjectContract.setGroupRole(GroupRoleContract.fromGroupRole(groupSubject.getGroupRole()));
        groupSubjectContract.setMembershipStartDate(groupSubject.getMembershipStartDate());
        groupSubjectContract.setMembershipEndDate(groupSubject.getMembershipEndDate());
        groupSubjectContract.setVoided(groupSubject.isVoided());
        return groupSubjectContract;
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
