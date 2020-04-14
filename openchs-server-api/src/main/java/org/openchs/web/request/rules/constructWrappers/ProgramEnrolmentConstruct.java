package org.openchs.web.request.rules.constructWrappers;

import org.openchs.dao.ConceptRepository;
import org.openchs.dao.EncounterTypeRepository;
import org.openchs.dao.IndividualRepository;
import org.openchs.dao.ProgramEnrolmentRepository;
import org.openchs.domain.*;
import org.openchs.service.IndividualService;
import org.openchs.web.request.*;
import org.openchs.web.request.rules.RulesContractWrapper.IndividualContractWrapper;
import org.openchs.web.request.rules.RulesContractWrapper.LowestAddressLevelContract;
import org.openchs.web.request.rules.RulesContractWrapper.ProgramEncounterContractWrapper;
import org.openchs.web.request.rules.RulesContractWrapper.ProgramEnrolmentContractWrapper;
import org.openchs.web.request.rules.request.ProgramEnrolmentRequestEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.validation.constraints.NotNull;
import java.util.List;
import java.util.stream.Collectors;

import static java.util.Collections.singletonList;

@Service
public class ProgramEnrolmentConstruct {
    private final Logger logger;
    private final ObservationConstruct observationConstruct;
    private final IndividualRepository individualRepository;
    private final ConceptRepository conceptRepository;

    @Autowired
    public ProgramEnrolmentConstruct(
            ObservationConstruct observationConstruct,
            IndividualRepository individualRepository,
            ConceptRepository conceptRepository) {
        logger = LoggerFactory.getLogger(this.getClass());
        this.observationConstruct = observationConstruct;
        this.individualRepository = individualRepository;
        this.conceptRepository = conceptRepository;
    }


    public ProgramEnrolmentContractWrapper constructProgramEnrolmentContract(ProgramEnrolmentRequestEntity programEnrolmentRequestEntity) {
        ProgramEnrolmentContractWrapper programEnrolmentContractWrapper = new ProgramEnrolmentContractWrapper();
        programEnrolmentContractWrapper.setEnrolmentDateTime(programEnrolmentRequestEntity.getEnrolmentDateTime());
        programEnrolmentContractWrapper.setProgramExitDateTime(programEnrolmentRequestEntity.getProgramExitDateTime());
        programEnrolmentContractWrapper.setUuid(programEnrolmentRequestEntity.getUuid());
        programEnrolmentContractWrapper.setVoided(programEnrolmentRequestEntity.isVoided());
        if(programEnrolmentRequestEntity.getObservations() != null){
            programEnrolmentContractWrapper.setObservations(programEnrolmentRequestEntity.getObservations().stream().map( x -> observationConstruct.constructObservation(x)).collect(Collectors.toList()));
        }
        if(programEnrolmentRequestEntity.getProgramExitObservations() != null){
            programEnrolmentContractWrapper.setExitObservations(programEnrolmentRequestEntity.getProgramExitObservations().stream().map( x -> observationConstruct.constructObservation(x)).collect(Collectors.toList()));
        }
        programEnrolmentContractWrapper.setSubject(getSubjectInfo(programEnrolmentRequestEntity.getIndividualUUID()));
        return programEnrolmentContractWrapper;
    }

    public IndividualContractWrapper getSubjectInfo(String individualUuid) {
        Individual individual = individualRepository.findByUuid(individualUuid);
        IndividualContractWrapper individualContractWrapper = new IndividualContractWrapper();
        if (individual == null)  {
            return null;
        }
        List<ObservationContract> observationContractsList = constructObservations(individual.getObservations());
        individualContractWrapper.setObservations(observationContractsList);
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
        GenderContract genderContract = new GenderContract();
        genderContract.setName(gender.getName());
        genderContract.setUuid(gender.getUuid());
        return genderContract;
    }

    public List<ObservationContract> constructObservations(@NotNull ObservationCollection observationCollection) {
        return observationCollection.entrySet().stream().map(entry -> {
            ObservationContract observationContract = new ObservationContract();
            Concept questionConcept = conceptRepository.findByUuid(entry.getKey());
            ConceptContract conceptContract = ConceptContract.create(questionConcept);
            observationContract.setConcept(conceptContract);
            Object value = entry.getValue();
            if (questionConcept.getDataType().equalsIgnoreCase(ConceptDataType.Coded.toString())) {
                List<String> answers = value instanceof List ? (List<String>) value : singletonList(value.toString());
                List<ConceptContract> answerConceptList = questionConcept.getConceptAnswers().stream()
                        .filter(it ->
                                answers.contains(it.getAnswerConcept().getUuid())
                        ).map(it -> {
                            ConceptContract cc = ConceptContract.create(it.getAnswerConcept());
                            cc.setAbnormal(it.isAbnormal());
                            return cc;
                        }).collect(Collectors.toList());
                observationContract.setValue(answerConceptList != null && answerConceptList.size() == 1 ? answerConceptList.get(0) : answerConceptList);
            } else {
                observationContract.setValue(value);
            }
            return observationContract;
        }).collect(Collectors.toList());
    }
}
