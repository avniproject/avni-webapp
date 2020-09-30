package org.openchs.web;

import org.codehaus.jettison.json.JSONObject;
import org.joda.time.DateTime;
import org.openchs.application.OrganisationConfigSettingKeys;
import org.openchs.dao.AddressLevelTypeRepository;
import org.openchs.dao.LocationRepository;
import org.openchs.domain.AddressLevel;
import org.openchs.domain.AddressLevelType;
import org.openchs.framework.security.UserContextHolder;
import org.openchs.service.LocationService;
import org.openchs.service.OrganisationConfigService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.hateoas.PagedResources;
import org.springframework.hateoas.Resource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
public class LocationHierarchyController implements RestControllerResourceProcessor<AddressLevel> {

    private final LocationRepository locationRepository;
    private final Logger logger;
    private final LocationService locationService;
    private final OrganisationConfigService organisationConfigService;
    private final AddressLevelTypeRepository addressLevelTypeRepository;

    @Autowired
    public LocationHierarchyController(LocationRepository locationRepository, LocationService locationService, OrganisationConfigService organisationConfigService, AddressLevelTypeRepository addressLevelTypeRepository) {
        this.locationRepository = locationRepository;
        this.locationService = locationService;
        this.organisationConfigService = organisationConfigService;
        this.addressLevelTypeRepository = addressLevelTypeRepository;
        this.logger = LoggerFactory.getLogger(this.getClass());
    }

    @GetMapping(value = "/locationHierarchy/search/lastModified")
    @PreAuthorize(value = "hasAnyAuthority('user','admin','organisation_admin')")
    @ResponseBody
    public PagedResources<Resource<AddressLevel>> getAddressLevels(
            @RequestParam("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime,
            Pageable pageable) {
        try {
            JSONObject jsonObj = new JSONObject(organisationConfigService.getOrganisationSettings(UserContextHolder.getUserContext().getOrganisationId())
                    .get("organisationConfig").toString());

            String lowestLevel = jsonObj.getString(String.valueOf(OrganisationConfigSettingKeys.lowestAddressLevelType));
            Double lowestAddressLevelType = Double.parseDouble(lowestLevel);

            AddressLevelType addressLevelType = addressLevelTypeRepository.findByLevel(lowestAddressLevelType);

            return wrap(locationRepository.findByAuditLastModifiedDateTimeAfterAndTypeLessThanEqual(lastModifiedDateTime, addressLevelType, pageable));
        } catch (Exception exception) {
            logger.error(exception.getMessage());
            return null;
        }
    }
}
