package org.avni.server.web;


import org.avni.server.application.projections.LocationProjection;
import org.avni.server.builder.BuilderException;
import org.avni.server.dao.LocationRepository;
import org.avni.server.dao.SyncParameters;
import org.avni.server.domain.AddressLevel;
import org.avni.server.service.LocationService;
import org.avni.server.service.ScopeBasedSyncService;
import org.avni.server.service.UserService;
import org.avni.server.util.ReactAdminUtil;
import org.avni.server.web.request.AddressLevelContractWeb;
import org.avni.server.web.request.LocationContract;
import org.avni.server.web.request.LocationEditContract;
import org.avni.server.web.request.webapp.search.LocationSearchRequest;
import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.webmvc.RepositoryRestController;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.hateoas.PagedResources;
import org.springframework.hateoas.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RepositoryRestController
public class LocationController implements RestControllerResourceProcessor<AddressLevel> {

    private LocationRepository locationRepository;
    private Logger logger;
    private UserService userService;
    private LocationService locationService;
    private ScopeBasedSyncService<AddressLevel> scopeBasedSyncService;

    @Autowired
    public LocationController(LocationRepository locationRepository, UserService userService, LocationService locationService, ScopeBasedSyncService<AddressLevel> scopeBasedSyncService) {
        this.locationRepository = locationRepository;
        this.userService = userService;
        this.locationService = locationService;
        this.scopeBasedSyncService = scopeBasedSyncService;
        this.logger = LoggerFactory.getLogger(this.getClass());
    }

    @RequestMapping(value = "/locations", method = RequestMethod.POST)
    @PreAuthorize(value = "hasAnyAuthority('admin','organisation_admin')")
    @Transactional
    public ResponseEntity<?> save(@RequestBody List<LocationContract> locationContracts) {
        try {
            List<AddressLevel> list = locationService.saveAll(locationContracts);
            if (list.size() == 1) {
                return new ResponseEntity<>(list.get(0), HttpStatus.CREATED);
            }
        } catch (BuilderException e) {
            logger.error(e.getMessage());
            return ResponseEntity.badRequest().body(ReactAdminUtil.generateJsonError(e.getMessage()));
        }
        return ResponseEntity.ok(null);
    }

    @GetMapping(value = "/locations")
    @PreAuthorize(value = "hasAnyAuthority('admin','organisation_admin')")
    @ResponseBody
    public Page<LocationProjection> getAll(Pageable pageable) {
        return locationRepository.findNonVoidedLocations(pageable);
    }

    @GetMapping(value = "locations/search/find")
    @PreAuthorize(value = "hasAnyAuthority('admin', 'user')")
    @ResponseBody
    public Page<LocationProjection> find(
            @RequestParam(value = "title", defaultValue = "") String title,
            @RequestParam(value = "typeId", required = false) Integer typeId,
            @RequestParam(value = "parentId", required = false) Integer parentId,
            Pageable pageable) {
        return locationService.find(new LocationSearchRequest(title, typeId, parentId, pageable));
    }

    @GetMapping(value = "/locations/search/findAllById")
    @PreAuthorize(value = "hasAnyAuthority('admin','organisation_admin')")
    @ResponseBody
    public List<LocationProjection> findByIdIn(@Param("ids") Long[] ids) {
        if (ids == null || ids.length == 0) {
            return new ArrayList<>();
        }
        return locationRepository.findByIdIn(ids);
    }

    @RequestMapping(value = {"/locations/search/lastModified", "/locations/search/byCatchmentAndLastModified"}, method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user','admin')")
    @ResponseBody
    public PagedResources<Resource<AddressLevel>> getAddressLevelsByOperatingIndividualScope(
            @RequestParam("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime,
            @RequestParam("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime now,
            Pageable pageable) {
        return wrap(scopeBasedSyncService.getSyncResultsByCatchment(locationRepository, userService.getCurrentUser(), lastModifiedDateTime, now, pageable, SyncParameters.SyncEntityName.Location));
    }

    @PutMapping(value = "/locations/{id}")
    @PreAuthorize(value = "hasAnyAuthority('admin', 'organisation_admin')")
    @Transactional
    public ResponseEntity updateLocation(@RequestBody LocationEditContract locationEditContract,
                                         @PathVariable("id") Long id) {
        logger.info(String.format("Processing location update request: %s", locationEditContract.toString()));
        AddressLevel location;
        try {
            location = locationService.update(locationEditContract, id);
        } catch (Exception e) {
            logger.error(e.getMessage());
            return ResponseEntity.badRequest().body(ReactAdminUtil.generateJsonError(e.getMessage()));
        }
        return new ResponseEntity<>(location, HttpStatus.OK);
    }

    @DeleteMapping(value = "/locations/{id}")
    @PreAuthorize(value = "hasAnyAuthority('admin', 'organisation_admin')")
    @Transactional
    public ResponseEntity voidLocation(@PathVariable("id") Long id) {
        AddressLevel location = locationRepository.findOne(id);
        if (location == null)
            return ResponseEntity.badRequest().body(String.format("Location with id '%d' not found", id));

        if (location.getNonVoidedSubLocations().size() > 0)
            return ResponseEntity.badRequest().body(ReactAdminUtil.generateJsonError(
                    String.format("Cannot delete location '%s' until all sub locations are deleted", location.getTitle()))
            );

        location.setTitle(String.format("%s (voided~%d)", location.getTitle(), location.getId()));
        location.setVoided(true);
        location.updateAudit();
        locationRepository.save(location);

        return ResponseEntity.ok(null);
    }

    @GetMapping(value = "/locations/search/typeId/{typeId}")
    @PreAuthorize(value = "hasAnyAuthority('user', 'admin')")
    @ResponseBody
    public List<AddressLevelContractWeb> getLocationsByTypeId(@PathVariable("typeId") Long typeId) {
        return locationRepository.findNonVoidedLocationsByTypeId(typeId).stream()
                .map(AddressLevelContractWeb::fromEntity)
                .collect(Collectors.toList());
    }

    @GetMapping(value = "locations/parents/{uuid}")
    @PreAuthorize(value = "hasAnyAuthority('admin', 'user')")
    @ResponseBody
    public List<LocationProjection> getParents(@PathVariable("uuid") String uuid,
                                               @RequestParam(value = "maxLevelTypeId", required = false) Long maxLevelTypeId) {
        return locationService.getParents(uuid, maxLevelTypeId);
    }


    @GetMapping(value = "/locations/web")
    @PreAuthorize(value = "hasAnyAuthority('user')")
    @ResponseBody
    public ResponseEntity getLocationByParam(@RequestParam("uuid") String uuid) {
        LocationProjection addressLevel = locationRepository.findNonVoidedLocationsByUuid(uuid);
        if (addressLevel == null) {
            return ResponseEntity.notFound().build();
        }
        return new ResponseEntity<>(AddressLevelContractWeb.fromEntity(addressLevel), HttpStatus.OK);
    }
}
