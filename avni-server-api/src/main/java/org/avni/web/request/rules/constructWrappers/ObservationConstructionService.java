package org.avni.web.request.rules.constructWrappers;

import org.avni.dao.ConceptRepository;
import org.avni.domain.Concept;
import org.avni.domain.ConceptDataType;
import org.avni.web.request.*;
import org.avni.web.request.rules.request.ObservationRequestEntity;
import org.avni.web.request.rules.response.KeyValueResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class ObservationConstructionService {

    private final Logger logger;
    private final ConceptRepository conceptRepository;

    @Autowired
    public ObservationConstructionService(
            ConceptRepository conceptRepository) {
        logger = LoggerFactory.getLogger(this.getClass());
        this.conceptRepository = conceptRepository;
    }

    public ObservationModelContract constructObservation(ObservationRequestEntity observationRequestEntity) {
        Concept concept = conceptRepository.findByUuid(observationRequestEntity.getConceptUUID());
        ObservationModelContract observationContract = new ObservationModelContract();
        observationContract.setValue(observationRequestEntity.getValue());
        ConceptModelContract conceptModelContract = ConceptModelContract.fromConcept(concept);
        observationContract.setConcept(conceptModelContract);
        return observationContract;
    }


    private ConceptContract generateConceptContract(String name) {
        Concept concept = conceptRepository.findByName(name);
        return ConceptContract.create(concept);
    }

    public List<ObservationContract> responseObservation(List<KeyValueResponse> decisionConceptValue) {
        return decisionConceptValue.stream()
                .map(decision -> decision.getValue() != null ? getObservationContract(decision) : null)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    private ObservationContract getObservationContract(KeyValueResponse decision) {
        ObservationContract observationContract = new ObservationContract();
        Concept concept = conceptRepository.findByName(decision.getName());
        observationContract.setConcept(ConceptContract.create(concept));
        if (concept.getDataType().equals(ConceptDataType.Coded.name())) {
            List<Object> decisionValues = (List<Object>) decision.getValue();
            List<ConceptContract> answerConceptList = decisionValues.stream().map(value -> {
                ConceptContract contract = generateConceptContract(value.toString());
                contract.setAbnormal(contract.isAbnormal());
                return contract;
            }).collect(Collectors.toList());
            observationContract.setValue(answerConceptList);
        } else {
            observationContract.setValue(decision.getValue());
        }
        return observationContract;
    }
}
