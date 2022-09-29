package org.avni.server.web.resourceProcessors;

import org.avni.server.domain.Checklist;
import org.springframework.hateoas.Link;
import org.springframework.hateoas.Resource;

public class ChecklistResourceProcessor implements ResourceProcessor<Checklist>{
    @Override
    public Resource<Checklist> process(Resource<Checklist> resource) {
        Checklist checklist = resource.getContent();
        resource.removeLinks();
        resource.add(new Link(checklist.getProgramEnrolment().getUuid(), "programEnrolmentUUID"));
        if (checklist.getChecklistDetail() != null) {
            resource.add(new Link(checklist.getChecklistDetail().getUuid(), "checklistDetailUUID"));
        }
        return resource;
    }

}
