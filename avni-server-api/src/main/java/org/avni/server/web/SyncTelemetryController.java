package org.avni.server.web;

import org.avni.server.dao.SyncTelemetryRepository;
import org.avni.server.domain.Organisation;
import org.avni.server.domain.SyncTelemetry;
import org.avni.server.domain.User;
import org.avni.server.framework.security.UserContextHolder;
import org.avni.server.web.request.SyncTelemetryRequest;
import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.hateoas.Link;
import org.springframework.hateoas.PagedResources;
import org.springframework.hateoas.Resource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import javax.transaction.Transactional;
import java.util.List;

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
    public PagedResources<Resource<SyncTelemetry>> getAll(@RequestParam(value = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) DateTime startDate,
                                                          @RequestParam(value = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) DateTime endDate,
                                                          @RequestParam(value = "userIds", required = false, defaultValue = "") List<Long> userIds,
                                                          Pageable pageable) {
        if (startDate == null && userIds.isEmpty()) {
            return wrap(syncTelemetryRepository.findAllByOrderByIdDesc(pageable));
        } else if (startDate != null && !userIds.isEmpty()) {
            return wrap(syncTelemetryRepository.findAllByUserIdInAndSyncStartTimeBetweenOrderByIdDesc(userIds, startDate, endDate, pageable));
        } else if (!userIds.isEmpty()) {
            return wrap(syncTelemetryRepository.findAllByUserIdInOrderByIdDesc(userIds, pageable));
        } else {
            return wrap(syncTelemetryRepository.findAllBySyncStartTimeBetweenOrderByIdDesc(startDate, endDate, pageable));
        }
    }

    @Override
    public Resource<SyncTelemetry> process(Resource<SyncTelemetry> resource) {
        SyncTelemetry syncTelemetry = resource.getContent();
        resource.removeLinks();
        resource.add(new Link(syncTelemetry.getUser().getName(), "userName"));
        return resource;
    }
}
