package org.openchs.web;

import org.openchs.dao.AddressLevelRepository;
import org.openchs.dao.CatchmentRepository;
import org.openchs.domain.AddressLevel;
import org.openchs.domain.Catchment;
import org.openchs.web.request.AddressLevelContract;
import org.openchs.web.request.CatchmentContract;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.transaction.Transactional;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
public class CatchmentController {

    private final Logger logger;
    private CatchmentRepository catchmentRepository;
    private AddressLevelRepository addressLevelRepository;

    @Autowired
    public CatchmentController(CatchmentRepository catchmentRepository, AddressLevelRepository addressLevelRepository) {
        this.catchmentRepository = catchmentRepository;
        this.addressLevelRepository = addressLevelRepository;
        logger = LoggerFactory.getLogger(this.getClass());
    }

    @RequestMapping(value = "/catchments", method = RequestMethod.POST)
    @PreAuthorize(value = "hasAnyAuthority('admin')")
    @Transactional
    void save(@RequestBody List<CatchmentContract> catchmentRequests) {
        for (CatchmentContract catchmentRequest : catchmentRequests) {
            logger.info(String.format("Processing catchment request: %s", catchmentRequest.toString()));

            if (conceptExistsWithSameNameAndDifferentUUID(catchmentRequest)) {
                throw new RuntimeException(String.format("Catchment %s exists with different uuid", catchmentRequest.getName()));
            }

            Catchment catchment = catchmentRepository.findByUuid(catchmentRequest.getUuid());
            if (catchment == null) {
                logger.info(String.format("Creating catchment"));
                catchment = createCatchment(catchmentRequest);
            }
            catchment.setName(catchmentRequest.getName());

            if (catchment.getAddressLevels() == null) {
                catchment.setAddressLevels(new HashSet<>());
            }
            addOrUpdateAddressLevels(catchmentRequest, catchment);
            removeObsoleteAddressLevelsFromCatchment(catchment, catchmentRequest);
            catchmentRepository.save(catchment);
        }
    }

    private void addOrUpdateAddressLevels(CatchmentContract catchmentRequest, Catchment catchment) {
        for (AddressLevelContract addressLevelRequest : catchmentRequest.getAddressLevels()) {
            AddressLevel addressLevel = catchment.findAddressLevel(addressLevelRequest.getUuid());
            if (addressLevel == null) {
                addressLevel = addressLevelRepository.findByUuid(addressLevelRequest.getUuid());
                if (addressLevel == null) {
                    addressLevel = createAddressLevel(addressLevelRequest);
                }
                catchment.addAddressLevel(addressLevel);
            }
            addressLevel.setTitle(addressLevelRequest.getName());
            addressLevel.setLevel(addressLevelRequest.getLevel());
            addressLevel.setAttributes(addressLevelRequest.getAttributes());
            addressLevelRepository.save(addressLevel);
        }
    }

    private void removeObsoleteAddressLevelsFromCatchment(Catchment catchment, CatchmentContract catchmentRequest) {
        Set<String> uuidsFromRequest = catchmentRequest.getAddressLevels().stream().map(AddressLevelContract::getUuid).collect(Collectors.toSet());
        Set<AddressLevel> addressLevels = new HashSet<>(catchment.getAddressLevels());
        for (AddressLevel addressLevel : addressLevels) {
            if (!uuidsFromRequest.contains(addressLevel.getUuid())) {
                logger.info("Removing AddressLevel " + addressLevel.getTitle() + " from catchment " + catchment.getName());
                catchment.remove(addressLevel);
            }
        }
    }

    private AddressLevel createAddressLevel(AddressLevelContract addressLevelRequest) {
        AddressLevel addressLevel;
        logger.info(String.format("Creating addressLevel: %s", addressLevelRequest.getName()));
        addressLevel = new AddressLevel();
        addressLevel.setUuid(addressLevelRequest.getUuid());
        return addressLevel;
    }

    private Catchment createCatchment(CatchmentContract catchmentContract) {
        Catchment catchment = new Catchment();
        catchment.setUuid(catchmentContract.getUuid());
        return catchment;
    }

    private boolean conceptExistsWithSameNameAndDifferentUUID(CatchmentContract catchmentRequest) {
        Catchment catchment = catchmentRepository.findByName(catchmentRequest.getName());
        return catchment != null && !catchment.getUuid().equals(catchmentRequest.getUuid());
    }

}
