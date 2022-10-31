package org.avni.server.web.request;

import org.avni.server.domain.ConceptAnswer;

public class ConceptAnswerModelContract {

    private String uuid;
    private ConceptModelContract concept;
    private Double answerOrder;
    private Boolean abnormal;
    private Boolean unique;
    private Boolean voided;

    public static ConceptAnswerModelContract fromConceptAnswer(ConceptAnswer answer) {
        ConceptAnswerModelContract conceptAnswerModelContract = new ConceptAnswerModelContract();
        conceptAnswerModelContract.setUuid(answer.getUuid());
        conceptAnswerModelContract.setAbnormal(answer.isAbnormal());
        conceptAnswerModelContract.setAnswerOrder(answer.getOrder());
        conceptAnswerModelContract.setUnique(answer.isUnique());
        conceptAnswerModelContract.setVoided(answer.isVoided());
        conceptAnswerModelContract.setConcept(ConceptModelContract.fromConcept(answer.getAnswerConcept()));
        return conceptAnswerModelContract;
    }

    public String getUuid() {
        return uuid;
    }

    public void setUuid(String uuid) {
        this.uuid = uuid;
    }

    public ConceptModelContract getConcept() {
        return concept;
    }

    public void setConcept(ConceptModelContract concept) {
        this.concept = concept;
    }

    public Double getAnswerOrder() {
        return answerOrder;
    }

    public void setAnswerOrder(Double answerOrder) {
        this.answerOrder = answerOrder;
    }

    public Boolean getAbnormal() {
        return abnormal;
    }

    public void setAbnormal(Boolean abnormal) {
        this.abnormal = abnormal;
    }

    public Boolean getUnique() {
        return unique;
    }

    public void setUnique(Boolean unique) {
        this.unique = unique;
    }

    public Boolean getVoided() {
        return voided;
    }

    public void setVoided(Boolean voided) {
        this.voided = voided;
    }
}
