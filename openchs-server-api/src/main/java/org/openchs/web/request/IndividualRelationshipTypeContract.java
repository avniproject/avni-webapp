package org.openchs.web.request;

import org.openchs.web.request.webapp.IndividualRelationContract;

public class IndividualRelationshipTypeContract extends ReferenceDataContract{
    private IndividualRelationContract individualAIsToBRelation = new IndividualRelationContract();
    private IndividualRelationContract individualBIsToARelation = new IndividualRelationContract();

    public IndividualRelationContract getIndividualAIsToBRelation() {
        return individualAIsToBRelation;
    }

    public void setIndividualAIsToBRelation(IndividualRelationContract individualAIsToBRelation) {
        this.individualAIsToBRelation = individualAIsToBRelation;
    }

    public IndividualRelationContract getIndividualBIsToARelation() {
        return individualBIsToARelation;
    }

    public void setIndividualBIsToARelation(IndividualRelationContract individualBIsToARelation) {
        this.individualBIsToARelation = individualBIsToARelation;
    }
}
