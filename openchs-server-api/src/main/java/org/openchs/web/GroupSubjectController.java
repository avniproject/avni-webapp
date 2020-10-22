package org.openchs.web;

import org.joda.time.DateTime;
import org.openchs.dao.*;
import org.openchs.domain.GroupRole;
import org.openchs.domain.GroupSubject;
import org.openchs.domain.Individual;
import org.openchs.domain.SubjectType;
import org.openchs.service.UserService;
import org.openchs.web.request.GroupSubjectContract;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.hateoas.Link;
import org.springframework.hateoas.PagedResources;
import org.springframework.hateoas.Resource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;
import java.util.Collections;

@RestController
public class GroupSubjectController extends AbstractController<GroupSubject> implements RestControllerResourceProcessor<GroupSubject>, OperatingIndividualScopeAwareFilterController<GroupSubject> {

    private final GroupSubjectRepository groupSubjectRepository;
    private final UserService userService;
    private final IndividualRepository individualRepository;
    private final GroupRoleRepository groupRoleRepository;
    private final SubjectTypeRepository subjectTypeRepository;
    private final Logger logger;

    @Autowired
    public GroupSubjectController(GroupSubjectRepository groupSubjectRepository, UserService userService, IndividualRepository individualRepository, GroupRoleRepository groupRoleRepository, SubjectTypeRepository subjectTypeRepository) {
        this.groupSubjectRepository = groupSubjectRepository;
        this.userService = userService;
        this.individualRepository = individualRepository;
        this.groupRoleRepository = groupRoleRepository;
        this.subjectTypeRepository = subjectTypeRepository;
        logger = LoggerFactory.getLogger(this.getClass());
    }

    @RequestMapping(value = "/groupSubject", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user', 'organisation_admin')")
    public PagedResources<Resource<GroupSubject>> getGroupSubjectsByOperatingIndividualScope(
            @RequestParam("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime,
            @RequestParam("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime now,
            @RequestParam(value = "subjectTypeUuid", required = false) String groupSubjectTypeUuid,
            Pageable pageable) {
        if (groupSubjectTypeUuid == null || groupSubjectTypeUuid.isEmpty())
            return wrap(new PageImpl<>(Collections.emptyList()));
        SubjectType subjectType = subjectTypeRepository.findByUuid(groupSubjectTypeUuid);
        return wrap(getCHSEntitiesForUserByLastModifiedDateTimeAndFilterByType(userService.getCurrentUser(), lastModifiedDateTime, now, subjectType.getId(), pageable));
    }

    @RequestMapping(value = "/groupSubjects", method = RequestMethod.POST)
    @Transactional
    @PreAuthorize(value = "hasAnyAuthority('user', 'organisation_admin')")
    public void save(@RequestBody GroupSubjectContract request) {
        Individual groupSubject = individualRepository.findByUuid(request.getGroupSubjectUUID());
        Individual memberSubject = individualRepository.findByUuid(request.getMemberSubjectUUID());
        GroupRole groupRole = groupRoleRepository.findByUuid(request.getGroupRoleUUID());

        GroupSubject existingOrNewGroupSubject = newOrExistingEntity(groupSubjectRepository, request, new GroupSubject());
        existingOrNewGroupSubject.setGroupSubject(groupSubject);
        existingOrNewGroupSubject.setMemberSubject(memberSubject);
        existingOrNewGroupSubject.setGroupRole(groupRole);
        existingOrNewGroupSubject.setMembershipStartDate(request.getMembershipStartDate());
        existingOrNewGroupSubject.setMembershipEndDate(request.getMembershipEndDate());
        existingOrNewGroupSubject.setVoided(request.isVoided());

        groupSubjectRepository.save(existingOrNewGroupSubject);
    }

    @Override
    public Resource<GroupSubject> process(Resource<GroupSubject> resource) {
        GroupSubject groupSubject = resource.getContent();
        resource.removeLinks();
        resource.add(new Link(groupSubject.getGroupSubject().getUuid(), "groupSubjectUUID"));
        resource.add(new Link(groupSubject.getMemberSubject().getUuid(), "memberSubjectUUID"));
        resource.add(new Link(groupSubject.getGroupRole().getUuid(), "groupRoleUUID"));
        return resource;
    }

    @Override
    public OperatingIndividualScopeAwareRepositoryWithTypeFilter<GroupSubject> repository() {
        return groupSubjectRepository;
    }
}
