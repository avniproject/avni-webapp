package org.avni.server.web.resourceProcessors;

import org.avni.server.domain.Encounter;
import org.springframework.hateoas.Link;
import org.springframework.hateoas.Resource;

public class EncounterResourceProcessor implements ResourceProcessor<Encounter>{

    @Override
    public Resource<Encounter> process(Resource<Encounter> resource) {
        Encounter encounter = resource.getContent();
        resource.removeLinks();
        resource.add(new Link(encounter.getEncounterType().getUuid(), "encounterTypeUUID"));
        resource.add(new Link(encounter.getIndividual().getUuid(), "individualUUID"));
        return resource;
    }
}
