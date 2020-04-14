package org.openchs.web.request.rules.constructWrappers;

import org.openchs.dao.AddressLevelTypeRepository;
import org.openchs.dao.ConceptRepository;
import org.openchs.dao.GenderRepository;
import org.openchs.dao.SubjectTypeRepository;
import org.openchs.domain.Concept;
import org.openchs.domain.ConceptAnswer;
import org.openchs.web.request.ConceptContract;
import org.openchs.web.request.ObservationContract;
import org.openchs.web.request.rules.request.ObservationRequestEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Service
public class ObservationConstruct {

    private final Logger logger;
    private final ConceptRepository conceptRepository;

    @Autowired
    public ObservationConstruct(
            ConceptRepository conceptRepository,
            GenderRepository genderRepository,
            SubjectTypeRepository subjectTypeRepository,
            AddressLevelTypeRepository addressLevelTypeRepository) {
        logger = LoggerFactory.getLogger(this.getClass());
        this.conceptRepository = conceptRepository;
    }

    public ObservationContract constructObservation(ObservationRequestEntity observationRequestEntity){
        Concept concept = conceptRepository.findByUuid(observationRequestEntity.getConceptUUID());
        ObservationContract observationContract = new ObservationContract();
        ConceptContract conceptContract = new ConceptContract();
        conceptContract.setName(concept.getName());
        conceptContract.setUuid(concept.getUuid());
        conceptContract.setDataType(concept.getDataType());
        conceptContract.setAnswers(parseConceptAnswer(concept.getConceptAnswers()));
        observationContract.setConcept(conceptContract);
        observationContract.setValue(observationRequestEntity.getValue());
        return observationContract;
    }

    private List<ConceptContract> parseConceptAnswer(Set<ConceptAnswer> conceptAnswers){
        List<ConceptContract> conceptContractList = new ArrayList<>();
        conceptAnswers.stream().forEach( x -> {
            ConceptContract conceptContract = new ConceptContract();
            conceptContract.setName(x.getAnswerConcept().getName());
            conceptContract.setUuid(x.getAnswerConcept().getUuid());
            conceptContract.setDataType(x.getAnswerConcept().getDataType());
            conceptContractList.add(conceptContract);
        });
        return conceptContractList;
    }
}
