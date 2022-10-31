package org.avni.server.web.resourceProcessors;

import org.avni.server.domain.ProgramEnrolment;
import org.springframework.hateoas.Link;
import org.springframework.hateoas.Resource;

public class ProgramEnrolmentResourceProcessor implements ResourceProcessor<ProgramEnrolment>{

    @Override
    public Resource<ProgramEnrolment> process(Resource<ProgramEnrolment> resource) {
        ProgramEnrolment programEnrolment = resource.getContent();
        resource.removeLinks();
        resource.add(new Link(programEnrolment.getProgram().getUuid(), "programUUID"));
        resource.add(new Link(programEnrolment.getIndividual().getUuid(), "individualUUID"));
        if (programEnrolment.getProgramOutcome() != null) {
            resource.add(new Link(programEnrolment.getProgramOutcome().getUuid(), "programOutcomeUUID"));
        }
        return resource;
    }
}
