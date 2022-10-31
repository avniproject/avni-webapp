package org.avni.server.web;

import org.avni.server.domain.ResetSync;
import org.avni.server.domain.User;
import org.avni.server.framework.security.UserContextHolder;
import org.avni.server.service.ResetSyncService;
import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.hateoas.Link;
import org.springframework.hateoas.PagedResources;
import org.springframework.hateoas.Resource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ResetSyncController extends AbstractController<ResetSync> implements RestControllerResourceProcessor<ResetSync> {

    private final ResetSyncService resetSyncService;

    @Autowired
    public ResetSyncController(ResetSyncService resetSyncService) {
        this.resetSyncService = resetSyncService;
    }

    @RequestMapping(value = "/resetSyncs", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    public PagedResources<Resource<ResetSync>> fetchByLastModified(
            @RequestParam("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime,
            @RequestParam("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime now,
            Pageable pageable) {
        User user = UserContextHolder.getUserContext().getUser();
        return wrap(resetSyncService.getByLastModifiedForUser(lastModifiedDateTime, now, user, pageable));
    }

    @Override
    public Resource<ResetSync> process(Resource<ResetSync> resource) {
        ResetSync resetSync = resource.getContent();
        resource.removeLinks();
        if (resetSync.getSubjectType() != null) {
            resource.add(new Link(resetSync.getSubjectType().getUuid(), "subjectTypeUUID"));
        }
        return resource;
    }
}
