package org.openchs.web;

import org.openchs.dao.ConceptRepository;
import org.openchs.domain.Concept;
import org.openchs.domain.ConceptAnswer;
import org.openchs.domain.ConceptDataType;
import org.openchs.web.request.ConceptContract;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.transaction.Transactional;
import java.util.HashSet;
import java.util.List;

@RestController
public class ConceptController {
    private ConceptRepository conceptRepository;

    @Autowired
    public ConceptController(ConceptRepository conceptRepository) {
        this.conceptRepository = conceptRepository;
    }

    @RequestMapping(value = "/concepts", method = RequestMethod.POST)
    @Transactional
    void save(@RequestBody List<ConceptContract> conceptRequests) {
        conceptRequests.forEach(conceptRequest -> {
            System.out.println(String.format("Creating concept: %s", conceptRequest.toString()));
            Concept concept = createConceptIfNotExists(conceptRequest);
            if (concept == null) return;

            if (ConceptDataType.Coded.toString().equals(conceptRequest.getDataType())) {
                if (concept.getConceptAnswers() == null) concept.setConceptAnswers(new HashSet<>());
                for (short order = 1; order < conceptRequest.getAnswers().size(); order++) {
                    String answer = conceptRequest.getAnswers().get(order - 1);
                    ConceptAnswer conceptAnswer = concept.findConceptAnswer(answer);
                    if (conceptAnswer == null) {
                        conceptAnswer = new ConceptAnswer();
                        conceptAnswer.assignUUID();
                        conceptAnswer.setConcept(concept);
                        conceptAnswer.setAnswerConcept(conceptRepository.findByName(answer));
                        conceptAnswer.setOrder(order);
                    }
                    concept.addAnswer(conceptAnswer);
                };
            }

            conceptRepository.save(concept);
        });
    }

    private Concept createConceptIfNotExists(ConceptContract conceptContract) {
        Concept concept = conceptRepository.findByName(conceptContract.getName());
        if (conceptAlreadyExists(concept, conceptContract)) {
            return null;
        }

        concept = conceptRepository.findByUuid(conceptContract.getUuid());
        if (concept == null) {
            concept = new Concept();
            concept.setUuid(conceptContract.getUuid());
        }
        concept.setName(conceptContract.getName());
        concept.setDataType(conceptContract.getDataType());
        return concept;
    }

    private boolean conceptAlreadyExists(Concept concept, ConceptContract conceptRequest) {
        return concept != null && concept.getDataType().equals(conceptRequest.getDataType()) && !ConceptDataType.Coded.toString().equals(conceptRequest.getDataType());
    }
}