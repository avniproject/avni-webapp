package org.avni.web.resourceProcessors;

import org.avni.domain.Individual;
import org.avni.domain.ProgramEncounter;
import org.springframework.hateoas.Link;
import org.springframework.hateoas.Resource;

public class IndividualResourceProcessor implements ResourceProcessor<Individual>{

    @Override
    public Resource<Individual> process(Resource<Individual> resource) {
        Individual individual = resource.getContent();
        resource.removeLinks();
        if (individual.getAddressLevel() != null) {
            resource.add(new Link(individual.getAddressLevel().getUuid(), "addressUUID"));
        }
        if (individual.getGender() != null) {
            resource.add(new Link(individual.getGender().getUuid(), "genderUUID"));
        }
        if (individual.getSubjectType() != null) {
            resource.add(new Link(individual.getSubjectType().getUuid(), "subjectTypeUUID"));
        }
        return resource;
    }
}
