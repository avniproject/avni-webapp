package org.avni.server.web.resourceProcessors;

import org.avni.server.domain.ProgramEncounter;
import org.springframework.hateoas.Link;
import org.springframework.hateoas.Resource;

public class ProgramEncounterResourceProcessor implements ResourceProcessor<ProgramEncounter>{
    @Override
    public Resource<ProgramEncounter> process(Resource<ProgramEncounter> resource) {
        ProgramEncounter programEncounter = resource.getContent();
        resource.removeLinks();
        resource.add(new Link(programEncounter.getEncounterType().getUuid(), "encounterTypeUUID"));
        resource.add(new Link(programEncounter.getProgramEnrolment().getUuid(), "programEnrolmentUUID"));
        return resource;
    }
}
