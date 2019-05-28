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
import org.openchs.web.request.LocationContract;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.rest.webmvc.RepositoryRestController;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.hateoas.PagedResources;
import org.springframework.hateoas.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;
import javax.validation.constraints.NotNull;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
                AddressLevelType type = getType(locationContract);
                if (type == null) {
                    type = saveType(locationContract.getType(), locationContract.getLevel());
                }
                saveLocation(locationContract, type);
            }
        } catch (BuilderException e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(e.getMessage());
        }
        return ResponseEntity.ok(null);
    }

    @RequestMapping(value = "/locations/search/lastModified", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user','admin','organisation_admin')")
    public PagedResources<Resource<AddressLevel>> getAddressLevelsByOperatingIndividualScope(
            @RequestParam("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime,
            @RequestParam("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime now,
            Pageable pageable) {
        return wrap(getCHSEntitiesForUserByLastModifiedDateTime(userService.getCurrentUser(), lastModifiedDateTime, now, pageable));
    }

    @Override
    public OperatingIndividualScopeAwareRepository<AddressLevel> resourceRepository() {
        return locationRepository;
    }


    private AddressLevelType getType(LocationContract locationContract) {
        Long orgId = UserContextHolder.getUserContext().getOrganisation().getId();
        return locationContract.getAddressLevelTypeUUID() != null
                ? this.addressLevelTypeRepository.findByUuid(locationContract.getAddressLevelTypeUUID())
                : this.addressLevelTypeRepository.findByNameAndOrganisationId(locationContract.getType(), orgId);
    }

    private AddressLevelType saveType(String type, Double level) {
        AddressLevelType addressLevelType = new AddressLevelType();
        addressLevelType.setUuid(UUID.randomUUID().toString());
        addressLevelType.setName(type);
        addressLevelType.setLevel(level);
        return addressLevelTypeRepository.save(addressLevelType);
    }

    private void saveLocation(LocationContract contract, AddressLevelType type) throws BuilderException {
        LocationBuilder locationBuilder = new LocationBuilder(locationRepository.findByUuid(contract.getUuid()), type);
        locationBuilder.copy(contract);
        AddressLevel location = locationBuilder.build();
        updateOrganisationIfNeeded(location, contract);
        try {
            locationRepository.save(location);
        } catch (Exception e) {
            e.printStackTrace();
            throw new BuilderException(String.format("Unable to create Location{name='%s',level='%s',orgUUID='%s',..}: '%s'", contract.getName(), contract.getLevel(), contract.getOrganisationUUID(), e.getMessage()));
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

    @GetMapping(value = "/locations/search/find")
    @PreAuthorize(value = "hasAnyAuthority('admin', 'organisation_admin')")
    @ResponseBody
    public Page<AddressLevel> find(@RequestParam(value = "childrenOf", required = false) String childrenOf,
                                   Pageable pageable) {
        if (childrenOf != null && !childrenOf.equals("")) {
            return locationRepository.getAddressLevelsByLquery(childrenOf+".*{1}", pageable);
        }
        return locationRepository.getAddressLevelsByLquery("*{1}", pageable);
    }

}
