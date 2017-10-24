package org.openchs.web;

import org.openchs.dao.ConceptRepository;
import org.openchs.domain.Concept;
import org.openchs.domain.ConceptAnswer;
import org.openchs.domain.ConceptDataType;
import org.openchs.web.request.AnswerConceptContract;
import org.openchs.web.validation.ValidationException;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

public class Helper {

    public void updateAnswers(Concept concept, List<AnswerConceptContract> answersFromRequest, ConceptRepository conceptRepository) {
        addOrUpdateAnswers(concept, answersFromRequest, conceptRepository);
        removeUnwantedAnswers(concept, answersFromRequest);

    }

    private void removeUnwantedAnswers(Concept concept, List<AnswerConceptContract> answersFromRequest) {
        List<String> answerConceptUUIDs = answersFromRequest.stream().map(conceptAnswer -> conceptAnswer.getUuid()).collect(Collectors.toList());
        concept.removeOrphanedConceptAnswers(answerConceptUUIDs);
    }

    private void addOrUpdateAnswers(Concept concept, List<AnswerConceptContract> answersFromRequest, ConceptRepository conceptRepository) {
        for (int answerIndex = 0; answerIndex < answersFromRequest.size(); answerIndex++) {
            AnswerConceptContract answerConcept = answersFromRequest.get(answerIndex);
            concept.addAnswer(fetchOrCreateConceptAnswer(concept, answerConcept, (short) (answerIndex + 1), conceptRepository));
        }
    }

    private ConceptAnswer fetchOrCreateConceptAnswer(Concept concept, AnswerConceptContract answerConceptRequest, short answerOrder, ConceptRepository conceptRepository) {
        if(StringUtils.isEmpty(answerConceptRequest.getUuid())){
            throw new ValidationException("UUID missing for answer");
        }
        ConceptAnswer conceptAnswer = concept.findConceptAnswerByConceptUUID(answerConceptRequest.getUuid());
        if (conceptAnswer == null) {
            conceptAnswer = new ConceptAnswer();
            conceptAnswer.assignUUID();
        }
        conceptAnswer.setOrder(answerOrder);
        conceptAnswer.setAnswerConcept(fetchOrCreateAnswer(answerConceptRequest, conceptRepository));
        return conceptAnswer;
    }

    private Concept fetchOrCreateAnswer(AnswerConceptContract answerConceptRequest, ConceptRepository conceptRepository) {
        Concept answer = conceptRepository.findByUuid(answerConceptRequest.getUuid());
        if (answer == null) {
            answer = new Concept();
            answer.setUuid(answerConceptRequest.getUuid());
            answer.setDataType(ConceptDataType.NA.toString());
            if(StringUtils.isEmpty(answerConceptRequest.getName())){
                throw new ValidationException("Name missing for a new answer concept");
            }
        }
        if(!StringUtils.isEmpty(answerConceptRequest.getName())){
            answer.setName(answerConceptRequest.getName());
        }
        conceptRepository.save(answer);
        return answer;
    }


}
