package org.openchs.web;

import org.joda.time.DateTime;
import org.openchs.dao.*;
import org.openchs.domain.Checklist;
import org.openchs.domain.ChecklistDetail;
import org.openchs.service.UserService;
import org.openchs.web.request.ChecklistRequest;
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
import java.util.List;

@RestController
public class ChecklistController extends AbstractController<Checklist> implements RestControllerResourceProcessor<Checklist>, OperatingIndividualScopeAwareController<Checklist>, OperatingIndividualScopeAwareFilterController<Checklist> {
    private final ChecklistDetailRepository checklistDetailRepository;
    private final ChecklistRepository checklistRepository;
    private final ProgramEnrolmentRepository programEnrolmentRepository;
    private final UserService userService;

    @Autowired
    public ChecklistController(ChecklistRepository checklistRepository,
                               ProgramEnrolmentRepository programEnrolmentRepository,
                               ChecklistDetailRepository checklistDetailRepository, UserService userService) {
        this.checklistDetailRepository = checklistDetailRepository;
        this.checklistRepository = checklistRepository;
        this.programEnrolmentRepository = programEnrolmentRepository;
        this.userService = userService;
    }

    @Transactional
    @RequestMapping(value = "/txNewChecklistEntitys", method = RequestMethod.POST)
    @PreAuthorize(value = "hasAnyAuthority('user', 'organisation_admin')")
    public void save(@RequestBody ChecklistRequest checklistRequest) {
        Checklist checklist = newOrExistingEntity(checklistRepository, checklistRequest, new Checklist());
        checklist.setChecklistDetail(this.checklistDetailRepository.findByUuid(checklistRequest.getChecklistDetailUUID()));
        checklist.setProgramEnrolment(programEnrolmentRepository.findByUuid(checklistRequest.getProgramEnrolmentUUID()));
        checklist.setBaseDate(checklistRequest.getBaseDate());
        checklistRepository.save(checklist);
    }

    @Transactional
    @RequestMapping(value = "/checklists", method = RequestMethod.POST)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    public void saveOld(@RequestBody Object object) {

    }

    @RequestMapping(value = "/txNewChecklistEntity/search/byIndividualsOfCatchmentAndLastModified", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user', 'organisation_admin')")
    public PagedResources<Resource<Checklist>> getByIndividualsOfCatchmentAndLastModified(
            @RequestParam("catchmentId") long catchmentId,
            @RequestParam("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime,
            @RequestParam("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime now,
            Pageable pageable) {
        return wrap(checklistRepository.findByProgramEnrolmentIndividualAddressLevelVirtualCatchmentsIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(catchmentId, lastModifiedDateTime, now, pageable));
    }


    @RequestMapping(value = "/txNewChecklistEntity", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user', 'organisation_admin')")
    public PagedResources<Resource<Checklist>> getChecklistsByOperatingIndividualScope(
            @RequestParam("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime,
            @RequestParam("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime now,
            @RequestParam(value = "checklistDetailUuid", required = false) String checklistDetailUuid,
            Pageable pageable) {
        if (checklistDetailUuid == null) {
            return wrap(getCHSEntitiesForUserByLastModifiedDateTime(userService.getCurrentUser(), lastModifiedDateTime, now, pageable));
        } else {
            if (checklistDetailUuid.isEmpty()) return wrap(new PageImpl<>(Collections.emptyList()));
            ChecklistDetail checklistDetail = checklistDetailRepository.findByUuid(checklistDetailUuid);
            if(checklistDetail == null) return wrap(new PageImpl<>(Collections.emptyList()));
            return wrap(getCHSEntitiesForUserByLastModifiedDateTimeAndFilterByType(userService.getCurrentUser(), lastModifiedDateTime, now, checklistDetail.getId(), pageable));
        }
    }

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

    @Override
    public OperatingIndividualScopeAwareRepository<Checklist> resourceRepository() {
        return checklistRepository;
    }

    @Override
    public OperatingIndividualScopeAwareRepositoryWithTypeFilter<Checklist> repository() {
        return checklistRepository;
    }
}
