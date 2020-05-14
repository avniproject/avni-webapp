package org.openchs.web.request.webapp;

import org.openchs.domain.individualRelationship.IndividualRelation;
import org.openchs.web.request.ReferenceDataContract;

public class IndividualRelationContract extends ReferenceDataContract {

    public static IndividualRelationContract fromEntity(IndividualRelation relation) {
        IndividualRelationContract individualAIsToBRelation = new IndividualRelationContract();
        individualAIsToBRelation.setId(relation.getId());
        individualAIsToBRelation.setUuid(relation.getUuid());
        individualAIsToBRelation.setName(relation.getName());
        return individualAIsToBRelation;
    }
}
