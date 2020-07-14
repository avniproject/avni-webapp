package org.openchs.web.request.webapp;

import org.openchs.domain.individualRelationship.IndividualRelation;
import org.openchs.domain.individualRelationship.IndividualRelationGenderMapping;
import org.openchs.web.request.ReferenceDataContract;

import java.util.Optional;

public class IndividualRelationContract extends ReferenceDataContract {

    private String gender;

    public static IndividualRelationContract fromEntity(IndividualRelation relation) {
        IndividualRelationContract individualRelationContract = new IndividualRelationContract();
        individualRelationContract.setId(relation.getId());
        individualRelationContract.setUuid(relation.getUuid());
        individualRelationContract.setName(relation.getName());
        Optional<IndividualRelationGenderMapping> genderMapping = relation.getGenderMappings().stream().findFirst();
        if(genderMapping.isPresent()) {
            individualRelationContract.setGender(genderMapping.get().getGender().getName());
        }
        return individualRelationContract;
    }

    public String getGender() {
        return gender;
    }
    public void setGender(String gender) {
        this.gender = gender;
    }
}
