package org.avni.web.request;

import org.avni.domain.individualRelationship.IndividualRelationshipType;
import org.avni.web.request.webapp.IndividualRelationContract;

public class IndividualRelationshipTypeContract extends ReferenceDataContract {
    private IndividualRelationContract individualAIsToBRelation = new IndividualRelationContract();
    private IndividualRelationContract individualBIsToARelation = new IndividualRelationContract();

    public IndividualRelationshipTypeContract() {}

    public static IndividualRelationshipTypeContract fromEntity(IndividualRelationshipType relationshipType) {
        if (relationshipType.isVoided()) {
            return null;
        }
        IndividualRelationshipTypeContract individualRelationshipTypeContract = new IndividualRelationshipTypeContract();
        individualRelationshipTypeContract.setId(relationshipType.getId());
        individualRelationshipTypeContract.setUuid(relationshipType.getUuid());
        individualRelationshipTypeContract.setVoided(relationshipType.isVoided());
        individualRelationshipTypeContract.setIndividualAIsToBRelation(IndividualRelationContract.fromEntity(relationshipType.getIndividualAIsToB()));
        individualRelationshipTypeContract.setIndividualBIsToARelation(IndividualRelationContract.fromEntity(relationshipType.getIndividualBIsToA()));
        return individualRelationshipTypeContract;
    }

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
