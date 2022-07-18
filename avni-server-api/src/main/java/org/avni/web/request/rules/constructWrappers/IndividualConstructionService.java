package org.avni.web.request.rules.constructWrappers;

import org.avni.dao.GenderRepository;
import org.avni.dao.IndividualRepository;
import org.avni.dao.LocationRepository;
import org.avni.dao.SubjectTypeRepository;
import org.avni.domain.AddressLevel;
import org.avni.domain.Gender;
import org.avni.domain.Individual;
import org.avni.domain.SubjectType;
import org.avni.web.request.GenderContract;
import org.avni.web.request.SubjectTypeContract;
import org.avni.web.request.rules.RulesContractWrapper.IndividualContractWrapper;
import org.avni.web.request.rules.RulesContractWrapper.LowestAddressLevelContract;
import org.avni.web.request.rules.request.IndividualRequestEntity;
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
        Individual individual = individualRepository.findByUuid(individualRequestEntity.getUuid());
        return programEnrolmentConstructionService.getSubjectInfo(individual);
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
