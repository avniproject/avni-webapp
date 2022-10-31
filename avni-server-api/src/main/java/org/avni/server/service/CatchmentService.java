package org.avni.server.service;

import org.avni.server.builder.BuilderException;
import org.avni.server.dao.CatchmentRepository;
import org.avni.server.dao.LocationRepository;
import org.avni.server.domain.AddressLevel;
import org.avni.server.domain.Catchment;
import org.avni.server.domain.Organisation;
import org.avni.server.framework.security.UserContextHolder;
import org.avni.server.web.request.AddressLevelContract;
import org.avni.server.web.request.CatchmentContract;
import org.avni.server.web.request.CatchmentsContract;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import static java.util.Objects.isNull;

@Service
public class CatchmentService {
    private final CatchmentRepository catchmentRepository;
    private final UserService userService;
    private final LocationRepository locationRepository;
    private final Logger logger;

    @Autowired
    public CatchmentService(CatchmentRepository catchmentRepository, UserService userService, LocationRepository locationRepository) {
        this.catchmentRepository = catchmentRepository;
        this.userService = userService;
        this.locationRepository = locationRepository;
        logger = LoggerFactory.getLogger(this.getClass());
    }

    public Catchment createOrUpdate(String catchmentName, AddressLevel location) {
        Organisation organisation = UserContextHolder.getUserContext().getOrganisation();
        Catchment catchment = catchmentRepository.findByNameIgnoreCase(catchmentName);
        if (catchment == null) {
            catchment = new Catchment();
        }
        catchment.assignUUIDIfRequired();
        catchment.setName(catchmentName);
        catchment.addAddressLevel(location);
        catchment.setOrganisationId(organisation.getId());

        return catchmentRepository.save(catchment);
    }

    public List<Catchment> saveAllCatchments(CatchmentsContract catchmentsContract, Organisation organisation) throws BuilderException {
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

            addAddressLevels(catchmentRequest, catchment);
            removeObsoleteAddressLevelsFromCatchment(catchment, catchmentRequest);
            catchment.setOrganisationId(organisation.getId());

            catchments.add(catchmentRepository.save(catchment));
        }
        return catchments;
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
                catchment.removeAddressLevel(addressLevel);
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
