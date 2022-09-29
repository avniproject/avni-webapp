package org.avni.server.web.resourceProcessors;

import org.avni.server.domain.individualRelationship.IndividualRelationship;
import org.springframework.hateoas.Link;
import org.springframework.hateoas.Resource;

public class IndividualRelationshipResourceProcessor implements ResourceProcessor<IndividualRelationship>{
    @Override
    public Resource<IndividualRelationship> process(Resource<IndividualRelationship> resource) {
        IndividualRelationship individualRelationship = resource.getContent();
        resource.removeLinks();
        resource.add(new Link(individualRelationship.getRelationship().getUuid(), "relationshipTypeUUID"));
        resource.add(new Link(individualRelationship.getIndividuala().getUuid(), "individualAUUID"));
        resource.add(new Link(individualRelationship.getIndividualB().getUuid(), "individualBUUID"));
        return resource;
    }
}
