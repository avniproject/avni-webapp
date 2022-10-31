package org.avni.server.web.request;

import org.avni.server.domain.individualRelationship.IndividualRelationshipType;
import org.avni.server.web.request.webapp.IndividualRelationContract;

public class IndividualRelationshipTypeContract extends ReferenceDataContract {
    private org.avni.server.web.request.webapp.IndividualRelationContract individualAIsToBRelation = new org.avni.server.web.request.webapp.IndividualRelationContract();
    private org.avni.server.web.request.webapp.IndividualRelationContract individualBIsToARelation = new org.avni.server.web.request.webapp.IndividualRelationContract();

    public IndividualRelationshipTypeContract() {}

    public static IndividualRelationshipTypeContract fromEntity(IndividualRelationshipType relationshipType) {
        if (relationshipType.isVoided()) {
            return null;
        }
        IndividualRelationshipTypeContract individualRelationshipTypeContract = new IndividualRelationshipTypeContract();
        individualRelationshipTypeContract.setId(relationshipType.getId());
        individualRelationshipTypeContract.setUuid(relationshipType.getUuid());
        individualRelationshipTypeContract.setVoided(relationshipType.isVoided());
        individualRelationshipTypeContract.setIndividualAIsToBRelation(org.avni.server.web.request.webapp.IndividualRelationContract.fromEntity(relationshipType.getIndividualAIsToB()));
        individualRelationshipTypeContract.setIndividualBIsToARelation(org.avni.server.web.request.webapp.IndividualRelationContract.fromEntity(relationshipType.getIndividualBIsToA()));
        return individualRelationshipTypeContract;
    }

    public org.avni.server.web.request.webapp.IndividualRelationContract getIndividualAIsToBRelation() {
        return individualAIsToBRelation;
    }

    public void setIndividualAIsToBRelation(org.avni.server.web.request.webapp.IndividualRelationContract individualAIsToBRelation) {
        this.individualAIsToBRelation = individualAIsToBRelation;
    }

    public org.avni.server.web.request.webapp.IndividualRelationContract getIndividualBIsToARelation() {
        return individualBIsToARelation;
    }

    public void setIndividualBIsToARelation(IndividualRelationContract individualBIsToARelation) {
        this.individualBIsToARelation = individualBIsToARelation;
    }
}
