package org.avni.web.resourceProcessors;

import org.avni.domain.Encounter;
import org.avni.domain.Individual;
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
