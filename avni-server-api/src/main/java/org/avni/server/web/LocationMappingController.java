package org.avni.server.web;

import org.avni.server.dao.LocationMappingRepository;
import org.avni.server.dao.SyncParameters;
import org.avni.server.domain.ParentLocationMapping;
import org.avni.server.service.ScopeBasedSyncService;
import org.avni.server.service.UserService;
import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
public class LocationMappingController implements RestControllerResourceProcessor<ParentLocationMapping> {

    private LocationMappingRepository locationMappingRepository;
    private Logger logger;
    private UserService userService;
    private ScopeBasedSyncService<ParentLocationMapping> scopeBasedSyncService;

    @Autowired
    public LocationMappingController(UserService userService, LocationMappingRepository locationMappingRepository, ScopeBasedSyncService<ParentLocationMapping> scopeBasedSyncService) {
        this.userService = userService;
        this.locationMappingRepository = locationMappingRepository;
        this.scopeBasedSyncService = scopeBasedSyncService;
        this.logger = LoggerFactory.getLogger(this.getClass());
    }

    @RequestMapping(value = {"/locationMapping/search/lastModified", "/locationMapping/search/byCatchmentAndLastModified"}, method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user','admin')")
    public PagedResources<Resource<ParentLocationMapping>> getParentLocationMappingsByOperatingIndividualScope(
            @RequestParam("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime,
            @RequestParam("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime now,
            Pageable pageable) {
        return wrap(scopeBasedSyncService.getSyncResultsByCatchment(locationMappingRepository, userService.getCurrentUser(), lastModifiedDateTime, now, pageable, SyncParameters.SyncEntityName.LocationMapping));
    }

    @Override
    public Resource<ParentLocationMapping> process(Resource<ParentLocationMapping> resource) {
        ParentLocationMapping content = resource.getContent();
        resource.removeLinks();
        resource.add(new Link(content.getLocation().getUuid(), "locationUUID"));
        resource.add(new Link(content.getParentLocation().getUuid(), "parentLocationUUID"));
        return resource;
    }

}
