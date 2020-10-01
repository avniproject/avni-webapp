package org.openchs.web.request.rules.constructWrappers;

import org.openchs.dao.GenderRepository;
import org.openchs.dao.LocationRepository;
import org.openchs.dao.SubjectTypeRepository;
import org.openchs.domain.AddressLevel;
import org.openchs.domain.Gender;
import org.openchs.domain.SubjectType;
import org.openchs.web.request.GenderContract;
import org.openchs.web.request.SubjectTypeContract;
import org.openchs.web.request.rules.RulesContractWrapper.IndividualContractWrapper;
import org.openchs.web.request.rules.RulesContractWrapper.LowestAddressLevelContract;
import org.openchs.web.request.rules.request.IndividualRequestEntity;
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

    @Autowired
    public IndividualConstructionService(
                       GenderRepository genderRepository,
                       SubjectTypeRepository subjectTypeRepository,
                       LocationRepository locationRepository,
                       ObservationConstructionService observationConstructionService) {
        logger = LoggerFactory.getLogger(this.getClass());
        this.genderRepository = genderRepository;
        this.subjectTypeRepository = subjectTypeRepository;
        this.locationRepository = locationRepository;
        this.observationConstructionService = observationConstructionService;
    }


    public IndividualContractWrapper constructIndividualContract(IndividualRequestEntity individualRequestEntity){
        IndividualContractWrapper individualContract = new IndividualContractWrapper();
        individualContract.setUuid(individualRequestEntity.getUuid());
        individualContract.setFirstName(individualRequestEntity.getFirstName());
        individualContract.setLastName(individualRequestEntity.getLastName());
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
        return subjectTypeContract;
    }

    private LowestAddressLevelContract constructAddressLevel(String addressUuid) {
        AddressLevel addressLevel = locationRepository.findByUuid(addressUuid);
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

    private GenderContract constructGenderContract(String genderUuid) {
        Gender gender = genderRepository.findByUuid(genderUuid);
        GenderContract genderContract = new GenderContract(gender.getUuid(),gender.getName());
        return genderContract;
    }

}
