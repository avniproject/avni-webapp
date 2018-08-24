package org.openchs.web;

import org.openchs.builder.LocationBuilder;
import org.openchs.builder.BuilderException;
import org.openchs.dao.LocationRepository;
import org.openchs.dao.OrganisationRepository;
import org.openchs.domain.AddressLevel;
import org.openchs.web.request.LocationContract;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.transaction.Transactional;
import java.util.List;

@RestController
public class LocationController {

    private OrganisationRepository organisationRepository;
    private LocationRepository locationRepository;
    private Logger logger;

    @Autowired
    public LocationController(OrganisationRepository organisationRepository, LocationRepository locationRepository) {
        this.organisationRepository = organisationRepository;
        this.locationRepository = locationRepository;
        this.logger = LoggerFactory.getLogger(this.getClass());
    }

    @RequestMapping(value = "/locations", method = RequestMethod.POST)
    @PreAuthorize(value = "hasAnyAuthority('admin')")
    @Transactional
    public ResponseEntity<?> save(@RequestBody List<LocationContract> locationContracts) {
        try {
            for (LocationContract locationContract : locationContracts) {
                logger.info(String.format("Processing location request: %s", locationContract.toString()));
                saveLocation(locationContract);
            }
        } catch (BuilderException e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(e.getMessage());
        }
        return ResponseEntity.ok(null);
    }

    private void saveLocation(LocationContract locationRequest) throws BuilderException {
        LocationBuilder locationBuilder = new LocationBuilder(locationRepository.findByUuid(locationRequest.getUuid()));
        if (locationExistsWithSameNameAndDifferentUUID(locationRequest)) {
            throw new BuilderException(String.format("Location %s exists with different uuid", locationRequest.getName()));
        }
        locationBuilder.copy(locationRequest);
        locationRepository.save(locationBuilder.build());
    }

    private boolean locationExistsWithSameNameAndDifferentUUID(LocationContract locationRequest) {
        AddressLevel location = locationRepository.findByTitle(locationRequest.getName());
        return location != null && !location.getUuid().equals(locationRequest.getUuid());
    }

}
