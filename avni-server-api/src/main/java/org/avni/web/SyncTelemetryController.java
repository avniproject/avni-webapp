package org.avni.web;

import org.avni.dao.SyncTelemetryRepository;
import org.avni.domain.Individual;
import org.avni.domain.Organisation;
import org.avni.domain.SyncTelemetry;
import org.avni.domain.User;
import org.avni.framework.security.UserContextHolder;
import org.avni.web.request.SyncTelemetryRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.hateoas.Link;
import org.springframework.hateoas.PagedResources;
import org.springframework.hateoas.Resource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.transaction.Transactional;

@RestController
public class SyncTelemetryController implements RestControllerResourceProcessor<SyncTelemetry> {
    private final SyncTelemetryRepository syncTelemetryRepository;

    @Autowired
    public SyncTelemetryController(SyncTelemetryRepository syncTelemetryRepository) {
        this.syncTelemetryRepository = syncTelemetryRepository;
    }

    @RequestMapping(value = "syncTelemetry", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    public PagedResources<Resource<SyncTelemetry>> getEmpty(Pageable pageable) {
        return empty(pageable);
    }


    @RequestMapping(value = "syncTelemetry", method = RequestMethod.POST)
    @Transactional
    @PreAuthorize(value = "hasAnyAuthority('user')")
    public void saveSyncTelemetry(@RequestBody SyncTelemetryRequest request) {
        User user = UserContextHolder.getUserContext().getUser();
        Organisation organisation = UserContextHolder.getUserContext().getOrganisation();
        SyncTelemetry syncTelemetry = new SyncTelemetry();
        syncTelemetry.setUuid(request.getUuid());
        syncTelemetry.setUser(user);
        syncTelemetry.setOrganisationId(organisation.getId());
        syncTelemetry.setSyncStatus(request.getSyncStatus());
        syncTelemetry.setSyncStartTime(request.getSyncStartTime());
        syncTelemetry.setSyncEndTime(request.getSyncEndTime());
        syncTelemetry.setEntityStatus(request.getEntityStatus());
        syncTelemetry.setAppVersion(request.getAppVersion());
        syncTelemetry.setAndroidVersion(request.getAndroidVersion());
        syncTelemetry.setDeviceName(request.getDeviceName());
        syncTelemetry.setDeviceInfo(request.getDeviceInfo());
        syncTelemetry.setSyncSource(request.getSyncSource());
        syncTelemetryRepository.save(syncTelemetry);
    }

    @RequestMapping(value = "/report/syncTelemetry", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    public PagedResources<Resource<SyncTelemetry>> getAll(Pageable pageable) {
        return wrap(syncTelemetryRepository.findAllByOrderByIdDesc(pageable));
    }

    @Override
    public Resource<SyncTelemetry> process(Resource<SyncTelemetry> resource) {
        SyncTelemetry syncTelemetry = resource.getContent();
        resource.removeLinks();
        resource.add(new Link(syncTelemetry.getUser().getName(), "userName"));
        return resource;
    }
}
