package org.openchs.web;

import org.joda.time.DateTime;
import org.openchs.builder.BuilderException;
import org.openchs.dao.LocationRepository;
import org.openchs.dao.OperatingIndividualScopeAwareRepository;
import org.openchs.domain.AddressLevel;
import org.openchs.service.LocationService;
import org.openchs.service.UserService;
import org.openchs.util.ReactAdminUtil;
import org.openchs.web.request.LocationContract;
import org.openchs.web.request.LocationEditContract;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.rest.webmvc.RepositoryRestController;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.hateoas.PagedResources;
import org.springframework.hateoas.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;
import java.util.List;
import java.util.Map;

@RepositoryRestController
public class LocationController implements OperatingIndividualScopeAwareController<AddressLevel>, RestControllerResourceProcessor<AddressLevel> {

    private LocationRepository locationRepository;
    private Logger logger;
    private UserService userService;
    private LocationService locationService;

    @Autowired
    public LocationController(LocationRepository locationRepository, UserService userService, LocationService locationService) {
        this.locationRepository = locationRepository;
        this.userService = userService;
        this.locationService = locationService;
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
    public PagedResources<Resource<AddressLevel>> getAll(Pageable pageable) {
        return wrap(locationRepository.findPageByIsVoidedFalse(pageable));
    }

    @GetMapping(value = "locations/search/find")
    @PreAuthorize(value = "hasAnyAuthority('admin','organisation_admin')")
    @ResponseBody
    public PagedResources<Resource<AddressLevel>> find(
            @RequestParam(value = "title") String title,
            Pageable pageable) {
        return wrap(locationRepository.findByTitleIgnoreCaseStartingWithOrderByTitleAsc(title, pageable));
    }

    @RequestMapping(value = {"/locations/search/lastModified", "/locations/search/byCatchmentAndLastModified"}, method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user','admin','organisation_admin')")
    @ResponseBody
    public PagedResources<Resource<AddressLevel>> getAddressLevelsByOperatingIndividualScope(
            @RequestParam("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime,
            @RequestParam("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime now,
            Pageable pageable) {
        return wrap(getCHSEntitiesForUserByLastModifiedDateTime(userService.getCurrentUser(), lastModifiedDateTime, now, pageable));
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
        locationRepository.save(location);

        return ResponseEntity.ok(null);
    }

    @Override
    public OperatingIndividualScopeAwareRepository<AddressLevel> resourceRepository() {
        return locationRepository;
    }

}
