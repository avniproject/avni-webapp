package org.openchs.web;

import org.openchs.builder.BuilderException;
import org.openchs.dao.FacilityRepository;
import org.openchs.dao.LocationRepository;
import org.openchs.domain.*;
import org.openchs.web.request.*;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.transaction.Transactional;
import java.util.ArrayList;
import java.util.List;

@RestController
public class FacilityController extends AbstractController<Facility> {
    private final FacilityRepository facilityRepository;
    private final LocationRepository locationRepository;

    private static org.slf4j.Logger logger = LoggerFactory.getLogger(FacilityController.class);

    @Autowired
    public FacilityController(FacilityRepository facilityRepository, LocationRepository locationRepository) {
        this.facilityRepository = facilityRepository;
        this.locationRepository = locationRepository;
    }

    @RequestMapping(value = "/facilities", method = RequestMethod.POST)
    @Transactional
    @PreAuthorize(value = "hasAnyAuthority('admin', 'organisation_admin')")
    public ResponseEntity<?> save(@RequestBody List<FacilityContract> facilityRequests) {
        List<Facility> facilities = new ArrayList<>();
        for (FacilityContract facilityRequest : facilityRequests) {
            logger.info(String.format("Processing facility request: %s", facilityRequest.toString()));

            if (facilityExistsWithSameNameAndDifferentUUID(facilityRequest)) {
                try {
                    throw new BuilderException(String.format("Facility %s exists with different uuid", facilityRequest.getName()));
                } catch (BuilderException e) {
                    e.printStackTrace();
                    return ResponseEntity.badRequest().body(e.getMessage());
                }
            }

            Facility facility = facilityRepository.findByUuid(facilityRequest.getUuid());
            if (facility == null) {
                logger.info(String.format("Creating facility with uuid '%s'", facilityRequest.getUuid()));
                facility = createFacility(facilityRequest);
            }
            facility.setName(facilityRequest.getName());
            AddressLevel addressLevel = locationRepository.findByUuid(facilityRequest.getLocationUUID());
            logger.info(String.format("Adding location with uuid '%s'", facilityRequest.getLocationUUID()));
            if(addressLevel!= null){
                logger.info(String.format("Found address level"));
            }
            facility.setAddressLevel(addressLevel);

            facilities.add(facilityRepository.save(facility));
        }
        return ResponseEntity.ok(null);
    }


    private Facility createFacility(FacilityContract facilityContract) {
        Facility facility = new Facility();
        facility.setUuid(facilityContract.getUuid());
        return facility;
    }

    private boolean facilityExistsWithSameNameAndDifferentUUID(FacilityContract facilityRequest) {
        Facility facility = facilityRepository.findByName(facilityRequest.getName());
        return facility != null && !facility.getUuid().equals(facilityRequest.getUuid());
    }

}