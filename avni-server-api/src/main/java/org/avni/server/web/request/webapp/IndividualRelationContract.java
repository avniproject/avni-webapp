package org.avni.server.web.request.webapp;

import org.avni.server.domain.individualRelationship.IndividualRelation;
import org.avni.server.web.request.ReferenceDataContract;

import java.util.List;
import java.util.stream.Collectors;

public class IndividualRelationContract extends ReferenceDataContract {

    private List<String> genders;

    public static IndividualRelationContract fromEntity(IndividualRelation relation) {
        IndividualRelationContract individualRelationContract = new IndividualRelationContract();
        individualRelationContract.setId(relation.getId());
        individualRelationContract.setUuid(relation.getUuid());
        individualRelationContract.setName(relation.getName());
        List<String> genders = relation.getGenderMappings().stream()
                .filter(gm -> gm.getGender() != null)
                .map(gm -> gm.getGender().getName())
                .collect(Collectors.toList());
        individualRelationContract.setGenders(genders);
        return individualRelationContract;
    }

    public List<String> getGenders() {
        return genders;
    }

    public void setGenders(List<String> genders) {
        this.genders = genders;
    }
}
