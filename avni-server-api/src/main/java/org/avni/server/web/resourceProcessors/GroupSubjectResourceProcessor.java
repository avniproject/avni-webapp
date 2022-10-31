package org.avni.server.web.resourceProcessors;

import org.avni.server.domain.GroupSubject;
import org.springframework.hateoas.Link;
import org.springframework.hateoas.Resource;

public class GroupSubjectResourceProcessor implements ResourceProcessor<GroupSubject>{

    @Override
    public Resource<GroupSubject> process(Resource<GroupSubject> resource) {
        GroupSubject groupSubject = resource.getContent();
        resource.removeLinks();
        resource.add(new Link(groupSubject.getGroupSubject().getUuid(), "groupSubjectUUID"));
        resource.add(new Link(groupSubject.getMemberSubject().getUuid(), "memberSubjectUUID"));
        resource.add(new Link(groupSubject.getGroupRole().getUuid(), "groupRoleUUID"));
        return resource;
    }}
