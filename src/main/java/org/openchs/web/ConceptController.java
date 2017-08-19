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
            if (conceptExistsWithSameNameAndDifferentUUID(conceptRequest)) {
                throw new RuntimeException(String.format("Concept %s exists with different uuid", conceptRequest.getName()));
            }

            Concept concept = conceptRepository.findByUuid(conceptRequest.getUuid());
            if (concept == null) {
                concept = createConcept(conceptRequest);
            }

            concept.setName(conceptRequest.getName());
            concept.setDataType(conceptRequest.getDataType());

            if (ConceptDataType.Numeric.toString().equals(conceptRequest.getDataType())) {
                concept.setHighAbsolute(conceptRequest.getHighAbsolute());
                concept.setLowAbsolute(conceptRequest.getLowAbsolute());
                concept.setHighNormal(conceptRequest.getHighNormal());
                concept.setLowNormal(conceptRequest.getLowNormal());
                concept.setUnit(conceptRequest.getUnit());
            }

            if (ConceptDataType.Coded.toString().equals(conceptRequest.getDataType())) {
                if (concept.getConceptAnswers() == null) concept.setConceptAnswers(new HashSet<>());
                for (short order = 1; order < conceptRequest.getAnswers().size(); order++) {
                    String answer = conceptRequest.getAnswers().get(order - 1);
                    ConceptAnswer conceptAnswer = concept.findConceptAnswer(answer);
                    if (conceptAnswer == null) {
                        conceptAnswer = new ConceptAnswer();
                        conceptAnswer.assignUUID();
                        conceptAnswer.setConcept(concept);
                        Concept answerConcept = conceptRepository.findByName(answer);
                        if (answerConcept == null) {
                            answerConcept = new Concept();
                            answerConcept.setDataType(ConceptDataType.NA.toString());
                            answerConcept.setName(answer);
                            answerConcept.assignUUID();
                            answerConcept = conceptRepository.save(answerConcept);
                        }
                        conceptAnswer.setAnswerConcept(answerConcept);
                        conceptAnswer.setOrder(order);
                    }
                    concept.addAnswer(conceptAnswer);
                }
            }

            conceptRepository.save(concept);
        });
    }

    private Concept createConcept(ConceptContract conceptContract) {
        Concept concept = new Concept();
        concept.setUuid(conceptContract.getUuid());
        return concept;
    }

    private boolean conceptExistsWithSameNameAndDifferentUUID(ConceptContract conceptRequest) {
        Concept concept = conceptRepository.findByName(conceptRequest.getName());
        return concept != null && !concept.getUuid().equals(conceptRequest.getUuid());
    }
}