package org.openchs.web;

import org.openchs.builder.BuilderException;
import org.openchs.dao.LocationRepository;
import org.openchs.dao.CatchmentRepository;
import org.openchs.dao.OrganisationRepository;
import org.openchs.domain.AddressLevel;
import org.openchs.domain.Catchment;
import org.openchs.domain.Organisation;
import org.openchs.web.request.AddressLevelContract;
import org.openchs.web.request.CatchmentContract;
import org.openchs.web.request.CatchmentsContract;
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
import java.util.*;
import java.util.stream.Collectors;

import static java.util.Objects.isNull;

@RestController
public class CatchmentController {
    private final Logger logger;
    private CatchmentRepository catchmentRepository;
    private LocationRepository locationRepository;
    private OrganisationRepository organisationRepository;

    @Autowired
    public CatchmentController(CatchmentRepository catchmentRepository, LocationRepository locationRepository, OrganisationRepository organisationRepository) {
        this.catchmentRepository = catchmentRepository;
        this.locationRepository = locationRepository;
        this.organisationRepository = organisationRepository;
        logger = LoggerFactory.getLogger(this.getClass());
    }

    @RequestMapping(value = "/catchments", method = RequestMethod.POST)
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin')")
    @Transactional
    ResponseEntity<?> save(@RequestBody CatchmentsContract catchmentsContract) {
        try {
            Organisation organisation = organisationRepository.findByName(catchmentsContract.getOrganisation());
            List<Catchment> catchments = saveAll(catchmentsContract, organisation);
            if (!catchments.isEmpty()) {
                createMasterCatchment(catchments, organisation);
            }
        } catch (BuilderException e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(e.getMessage());
        }
        return ResponseEntity.ok(null);
    }

    private List<Catchment> saveAll(CatchmentsContract catchmentsContract, Organisation organisation) throws BuilderException {
        List<Catchment> catchments = new ArrayList<>();
        for (CatchmentContract catchmentRequest : catchmentsContract.getCatchments()) {
            logger.info(String.format("Processing catchment request: %s", catchmentRequest.toString()));

            if (catchmentExistsWithSameNameAndDifferentUUID(catchmentRequest)) {
                throw new BuilderException(String.format("Catchment %s exists with different uuid", catchmentRequest.getName()));
            }

            Catchment catchment = catchmentRepository.findByUuid(catchmentRequest.getUuid());
            if (catchment == null) {
                logger.info(String.format("Creating catchment with uuid '%s'", catchmentRequest.getUuid()));
                catchment = createCatchment(catchmentRequest);
            }
            catchment.setName(catchmentRequest.getName());
            catchment.setType(catchmentRequest.getType());

            addAddressLevels(catchmentRequest, catchment);
            removeObsoleteAddressLevelsFromCatchment(catchment, catchmentRequest);
            catchment.setOrganisationId(organisation.getId());

            catchments.add(catchmentRepository.save(catchment));
        }
        return catchments;
    }

    private void createMasterCatchment(List<Catchment> catchments, Organisation organisation) {
        Catchment masterCatchment = saveOrUpdateMasterCatchment(catchments.get(0).getType(), organisation);

        updateAddressLevelsOfMasterCatchment(catchments, masterCatchment);
    }

    private void updateAddressLevelsOfMasterCatchment(List<Catchment> catchments, Catchment masterCatchment) {
        List<AddressLevel> allAddressLevels = catchments.stream()
                .map(Catchment::getAddressLevels)
                .flatMap(x -> x.stream())
                .collect(Collectors.toList());
        allAddressLevels.forEach(addressLevel -> masterCatchment.addAddressLevel(addressLevel));
        locationRepository.save(allAddressLevels);
    }

    private Catchment saveOrUpdateMasterCatchment(String masterCatchmentType, Organisation organisation) {
        String masterCatchmentName = String.format("%s Master Catchment", organisation.getName());
        Catchment existingMasterCatchment = catchmentRepository.findByName(masterCatchmentName);
        Catchment masterCatchment = existingMasterCatchment == null? new Catchment(): existingMasterCatchment;
        masterCatchment.setName(masterCatchmentName);
        masterCatchment.setType(masterCatchmentType);
        masterCatchment.assignUUIDIfRequired();
        catchmentRepository.save(masterCatchment);
        return masterCatchment;
    }

    private void addAddressLevels(CatchmentContract catchmentRequest, Catchment catchment) throws BuilderException {
        List<AddressLevelContract> locations = catchmentRequest.getLocations();
        if(isNull(locations) || locations.isEmpty()) {
            logger.warn(String.format("Locations not defined in Catchment {uuid='%s',locations=undefined,...}", catchment.getUuid()));
        }
        for (AddressLevelContract addressLevelRequest : locations) {
            AddressLevel addressLevel = locationRepository.findByUuid(addressLevelRequest.getUuid());
            if (addressLevel == null) {
                logger.error(String.format("AddressLevel with UUID '%s' not found.", addressLevelRequest.getUuid()));
                throw new BuilderException(String.format("AddressLevel with UUID '%s' not found.", addressLevelRequest.getUuid()));
            }
            catchment.addAddressLevel(addressLevel);
        }
    }

    private void removeObsoleteAddressLevelsFromCatchment(Catchment catchment, CatchmentContract catchmentRequest) {
        Set<String> uuidsFromRequest = catchmentRequest.getLocations().stream().map(AddressLevelContract::getUuid).collect(Collectors.toSet());
        Set<AddressLevel> addressLevels = new HashSet<>(catchment.getAddressLevels());
        for (AddressLevel addressLevel : addressLevels) {
            if (!uuidsFromRequest.contains(addressLevel.getUuid())) {
                logger.info("Removing AddressLevel " + addressLevel.getTitle() + " from catchment " + catchment.getName());
                catchment.remove(addressLevel);
            }
        }
    }

    private Catchment createCatchment(CatchmentContract catchmentContract) {
        Catchment catchment = new Catchment();
        catchment.setUuid(catchmentContract.getUuid());
        return catchment;
    }

    private boolean catchmentExistsWithSameNameAndDifferentUUID(CatchmentContract catchmentRequest) {
        Catchment catchment = catchmentRepository.findByName(catchmentRequest.getName());
        return catchment != null && !catchment.getUuid().equals(catchmentRequest.getUuid());
    }

}
