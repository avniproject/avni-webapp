package org.avni.server.web.request.rules.constructWrappers;

import org.avni.server.dao.GenderRepository;
import org.avni.server.dao.IndividualRepository;
import org.avni.server.dao.LocationRepository;
import org.avni.server.dao.SubjectTypeRepository;
import org.avni.server.domain.AddressLevel;
import org.avni.server.domain.Gender;
import org.avni.server.domain.Individual;
import org.avni.server.domain.SubjectType;
import org.avni.server.web.request.rules.RulesContractWrapper.IndividualContractWrapper;
import org.avni.server.web.request.rules.RulesContractWrapper.LowestAddressLevelContract;
import org.avni.server.web.request.rules.request.IndividualRequestEntity;
import org.avni.server.web.request.GenderContract;
import org.avni.server.web.request.SubjectTypeContract;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
public class IndividualConstructionService {
    private final Logger logger;
    private final GenderRepository genderRepository;
    private final SubjectTypeRepository subjectTypeRepository;
    private final LocationRepository locationRepository;
    private final ObservationConstructionService observationConstructionService;
    private final ProgramEncounterConstructionService programEncounterConstructionService;
    private final IndividualRepository individualRepository;
    private final ProgramEnrolmentConstructionService programEnrolmentConstructionService;

    @Autowired
    public IndividualConstructionService(
            GenderRepository genderRepository,
            SubjectTypeRepository subjectTypeRepository,
            LocationRepository locationRepository,
            ObservationConstructionService observationConstructionService,
            ProgramEncounterConstructionService programEncounterConstructionService,
            IndividualRepository individualRepository,
            ProgramEnrolmentConstructionService programEnrolmentConstructionService) {
        this.programEncounterConstructionService = programEncounterConstructionService;
        this.individualRepository = individualRepository;
        this.programEnrolmentConstructionService = programEnrolmentConstructionService;
        logger = LoggerFactory.getLogger(this.getClass());
        this.genderRepository = genderRepository;
        this.subjectTypeRepository = subjectTypeRepository;
        this.locationRepository = locationRepository;
        this.observationConstructionService = observationConstructionService;
    }


    public IndividualContractWrapper constructIndividualContract(IndividualRequestEntity individualRequestEntity){
        IndividualContractWrapper individualContract = new IndividualContractWrapper();
        Individual individual = individualRepository.findByUuid(individualRequestEntity.getUuid());
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
        if (individual != null) {
            individualContract.setEncounters(programEncounterConstructionService.mapEncounters(individual.getEncounters()));
            individualContract.setEnrolments(programEncounterConstructionService.mapEnrolments(individual.getProgramEnrolments()));
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

}
