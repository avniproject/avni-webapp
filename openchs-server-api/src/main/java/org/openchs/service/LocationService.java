package org.openchs.service;

import org.openchs.builder.BuilderException;
import org.openchs.builder.LocationBuilder;
import org.openchs.dao.AddressLevelTypeRepository;
import org.openchs.dao.LocationRepository;
import org.openchs.dao.OrganisationRepository;
import org.openchs.domain.AddressLevel;
import org.openchs.domain.AddressLevelType;
import org.openchs.domain.Organisation;
import org.openchs.framework.security.UserContextHolder;
import org.openchs.web.request.LocationContract;
import org.openchs.web.request.LocationEditContract;
import org.openchs.web.request.ReferenceDataContract;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class LocationService {

    private final AddressLevelTypeRepository addressLevelTypeRepository;
    private final OrganisationRepository organisationRepository;
    private final LocationRepository locationRepository;
    private final Logger logger;

    @Autowired
    public LocationService(LocationRepository locationRepository, AddressLevelTypeRepository addressLevelTypeRepository, OrganisationRepository organisationRepository) {
        this.locationRepository = locationRepository;
        this.addressLevelTypeRepository = addressLevelTypeRepository;
        this.organisationRepository = organisationRepository;
        this.logger = LoggerFactory.getLogger(this.getClass());
    }

    public List<AddressLevel> saveAll(List<LocationContract> locationContracts) throws BuilderException {
        List<AddressLevel> saved = new ArrayList<>();
        for (LocationContract contract : locationContracts) saved.add(save(contract));
        return saved;
    }

    public AddressLevel save(LocationContract locationContract) throws BuilderException {
        logger.info(String.format("Processing location request: %s", locationContract.toString()));
        AddressLevelType type = getTypeByUuidOrName(locationContract);
        if (type == null) {
            type = createType(locationContract);
        }
        return saveLocation(locationContract, type);
    }

    private void setParent(LocationContract locationContract, AddressLevelType addressLevelType) {
        Long orgId = UserContextHolder.getUserContext().getOrganisation().getId();
        ReferenceDataContract parentLocationContract = locationContract.getParent();
        if (parentLocationContract != null) {
            AddressLevel parentLocation = locationRepository.findByUuid(parentLocationContract.getUuid());
            AddressLevelType parentAddressLevelType = addressLevelTypeRepository.findByNameIgnoreCaseAndOrganisationId(parentLocation.getType().getName(), orgId);
            addressLevelType.setParent(parentAddressLevelType);
        }
    }

    private AddressLevelType getTypeByUuidOrName(LocationContract locationContract) {
        Long orgId = UserContextHolder.getUserContext().getOrganisation().getId();
        return locationContract.getAddressLevelTypeUUID() != null
                ? addressLevelTypeRepository.findByUuid(locationContract.getAddressLevelTypeUUID())
                : addressLevelTypeRepository.findByNameIgnoreCaseAndOrganisationId(locationContract.getType(), orgId);
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

    public AddressLevel update(LocationEditContract locationEditContract, Long id) {
        AddressLevel location;
        if (locationEditContract.getUuid() != null) {
            location = locationRepository.findByUuid(locationEditContract.getUuid());
        } else {
            if (!id.equals(locationEditContract.getId())) {
                String message = String.format("Invalid location id '%d'", locationEditContract.getId());
                throw new RuntimeException(message);
            }
            location = locationRepository.findOne(id);
        }
        if (location == null) {
            String message = String.format("Location with id '%d' uuid '%s' not found", locationEditContract.getId(), locationEditContract.getUuid());
            throw new RuntimeException(message);
        }
        if (locationEditContract.getTitle().trim().equals("")) {
            throw new RuntimeException("Empty 'title' received");
        }
        if (!titleIsValid(location, locationEditContract.getTitle().trim(), location.getType())) {
            String message = String.format("Location with same name '%s' and type '%s' exists at this level",
                    locationEditContract.getTitle(),
                    location.getType().getName());
            throw new RuntimeException(message);
        }
        location.setTitle(locationEditContract.getTitle());
        locationRepository.save(location);
        return location;
    }

    private boolean titleIsValid(AddressLevel location, String title, AddressLevelType type) {
        return (location.isTopLevel() && locationRepository.findByTitleIgnoreCaseAndTypeAndParentIsNull(title, type) == null)
                || (!location.isTopLevel() && !location.getParent().containsSubLocation(title, type));
    }
}
