package org.openchs.web;

import org.joda.time.DateTime;
import org.openchs.builder.BuilderException;
import org.openchs.builder.LocationBuilder;
import org.openchs.dao.AddressLevelTypeRepository;
import org.openchs.dao.LocationRepository;
import org.openchs.dao.OperatingIndividualScopeAwareRepository;
import org.openchs.dao.OrganisationRepository;
import org.openchs.domain.AddressLevel;
import org.openchs.domain.AddressLevelType;
import org.openchs.domain.Organisation;
import org.openchs.framework.security.UserContextHolder;
import org.openchs.service.UserService;
import org.openchs.util.ReactAdminUtil;
import org.openchs.web.request.LocationContract;
import org.openchs.web.request.LocationEditContract;
import org.openchs.web.request.ReferenceDataContract;
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
import javax.validation.constraints.NotNull;
import java.util.List;
import java.util.UUID;

@RepositoryRestController
public class LocationController implements OperatingIndividualScopeAwareController<AddressLevel>, RestControllerResourceProcessor<AddressLevel> {

    private final AddressLevelTypeRepository addressLevelTypeRepository;
    private OrganisationRepository organisationRepository;
    private LocationRepository locationRepository;
    private Logger logger;
    private UserService userService;

    @Autowired
    public LocationController(OrganisationRepository organisationRepository,
                              LocationRepository locationRepository,
                              AddressLevelTypeRepository addressLevelTypeRepository,
                              UserService userService) {
        this.organisationRepository = organisationRepository;
        this.locationRepository = locationRepository;
        this.addressLevelTypeRepository = addressLevelTypeRepository;
        this.userService = userService;
        this.logger = LoggerFactory.getLogger(this.getClass());
    }

    @RequestMapping(value = "/locations", method = RequestMethod.POST)
    @PreAuthorize(value = "hasAnyAuthority('admin','organisation_admin')")
    @Transactional
    public ResponseEntity<?> save(@RequestBody List<LocationContract> locationContracts) {
        try {
            for (LocationContract locationContract : locationContracts) {
                logger.info(String.format("Processing location request: %s", locationContract.toString()));
                AddressLevelType type = getTypeByUuidOrName(locationContract);
                if (type == null) {
                    type = createType(locationContract);
                }
                if (locationContracts.size() == 1) {
                    AddressLevel newLocation = saveLocation(locationContract, type);
                    return new ResponseEntity<>(newLocation, HttpStatus.CREATED);
                }
                saveLocation(locationContract, type);
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
        return wrap(locationRepository.findByIsVoidedFalse(pageable));
    }

    @GetMapping(value = "locations/search/find")
    @PreAuthorize(value = "hasAnyAuthority('admin','organisation_admin')")
    @ResponseBody
    public PagedResources<Resource<AddressLevel>> find(
            @RequestParam(value = "title") String title,
            Pageable pageable) {
        return wrap(locationRepository.findByTitleIgnoreCaseContaining(title, pageable));
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

        if (locationEditContract.getUuid() != null) {
            location = locationRepository.findByUuid(locationEditContract.getUuid());
        } else {
            if (!id.equals(locationEditContract.getId()))
                return ResponseEntity.badRequest()
                        .body(String.format("Invalid location id '%d'", locationEditContract.getId()));

            location = locationRepository.findById(id);
        }

        if (location == null)
            return ResponseEntity.badRequest()
                    .body(String.format("Location with id '%d' uuid '%s' not found", locationEditContract.getId(), locationEditContract.getUuid()));

        if (locationEditContract.getTitle().trim().equals(""))
            return ResponseEntity.badRequest().body(ReactAdminUtil.generateJsonError("Empty 'title' received"));

        if (!titleIsValid(location, locationEditContract.getTitle().trim(), location.getType())) {
            return ResponseEntity.badRequest().body(
                    ReactAdminUtil.generateJsonError(
                            String.format("Location with same name '%s' and type '%s' exists at this level",
                                    locationEditContract.getTitle(),
                                    location.getType().getName())));
        }

        location.setTitle(locationEditContract.getTitle());
        try {
            locationRepository.save(location);
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
        AddressLevel location = locationRepository.findById(id);
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


    private AddressLevelType getTypeByUuidOrName(LocationContract locationContract) {
        Long orgId = UserContextHolder.getUserContext().getOrganisation().getId();
        return locationContract.getAddressLevelTypeUUID() != null
                ? this.addressLevelTypeRepository.findByUuid(locationContract.getAddressLevelTypeUUID())
                : this.addressLevelTypeRepository.findByNameIgnoreCaseAndOrganisationId(locationContract.getType(), orgId);
    }

    private AddressLevelType createType(LocationContract locationContract) {
        AddressLevelType addressLevelType = new AddressLevelType();
        addressLevelType.setUuid(UUID.randomUUID().toString());
        addressLevelType.setName(locationContract.getType());
        addressLevelType.setLevel(locationContract.getLevel());
        setParent(locationContract, addressLevelType);
        addressLevelTypeRepository.save(addressLevelType);
        return addressLevelType;
    }

    private void setParent(LocationContract locationContract, AddressLevelType addressLevelType) {
        Long orgId = UserContextHolder.getUserContext().getOrganisation().getId();
        ReferenceDataContract parentLocationContract = locationContract.getParent();
        if (parentLocationContract != null) {
            AddressLevel parentLocation = locationRepository.findByUuid(parentLocationContract.getUuid());
            AddressLevelType parentAddressLevelType = addressLevelTypeRepository.findByNameIgnoreCaseAndOrganisationId(parentLocation.getType().getName(), orgId);
            addressLevelType.setParentId(parentAddressLevelType.getId());
        }
    }

    private boolean titleIsValid(AddressLevel location, String title, AddressLevelType type) {
        return (location.isTopLevel() && locationRepository.findByTitleIgnoreCaseAndTypeAndParentIsNull(title, type) == null)
                || (!location.isTopLevel() && !location.getParent().containsSubLocation(title, type));
    }

    private AddressLevel saveLocation(LocationContract contract, AddressLevelType type) throws BuilderException {
        LocationBuilder locationBuilder = new LocationBuilder(locationRepository.findByUuid(contract.getUuid()), type);
        locationBuilder.copy(contract);
        AddressLevel location = locationBuilder.build();
        updateOrganisationIfNeeded(location, contract);

        // Validate location title/name is unique only if new AddressLevel
        if (location.getId() == null && !titleIsValid(location, contract.getName().trim(), type))
            throw new BuilderException(String.format("Location with same name '%s' and type '%s' exists at this level", contract.getName(), type.getName()));

        try {
            locationRepository.save(location);
        } catch (Exception e) {
            logger.error(e.getMessage());
            throw new BuilderException(String.format("Unable to create Location{name='%s',level='%s',orgUUID='%s',..}: '%s'", contract.getName(), contract.getLevel(), contract.getOrganisationUUID(), e.getMessage()));
        }
        try {
            updateLineage(location);
            locationRepository.save(location);
        } catch (Exception e) {
            logger.error(e.getMessage());
            throw new BuilderException(String.format("Unable to update lineage for location with Id %s - %s", location.getId(), e.getMessage()));
        }
        return location;
    }

    private void updateLineage(AddressLevel location) {
        if (location.getParent() == null) {
            location.setLineage(location.getId().toString());
        } else {
            String lineage = location.getParent().getLineage() + "." + location.getId().toString();
            location.setLineage(lineage);
        }
    }

    private void updateOrganisationIfNeeded(AddressLevel location, @NotNull LocationContract contract) {
        String organisationUuid = contract.getOrganisationUUID();
        if (organisationUuid != null) {
            Organisation organisation = organisationRepository.findByUuid(organisationUuid);
            if (organisation == null) {
                throw new RuntimeException(String.format("Organisation not found with uuid :'%s'", organisationUuid));
            }
            location.setOrganisationId(organisation.getId());
        }
    }
}
