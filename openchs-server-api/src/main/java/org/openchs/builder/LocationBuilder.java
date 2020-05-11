package org.openchs.builder;

import org.openchs.dao.LocationRepository;
import org.openchs.domain.AddressLevel;
import org.openchs.domain.AddressLevelType;
import org.openchs.domain.ParentLocationMapping;
import org.openchs.framework.ApplicationContextProvider;
import org.openchs.web.request.LocationContract;
import org.openchs.web.request.ReferenceDataContract;
import org.openchs.web.validation.ValidationException;
import org.springframework.util.StringUtils;

import java.util.UUID;

public class LocationBuilder extends BaseBuilder<AddressLevel, LocationBuilder> {

    private final AddressLevelType type;
    private LocationRepository locationRepository;

    public LocationBuilder(AddressLevel existingEntity, AddressLevelType type) {
        super(existingEntity, new AddressLevel());
        this.type = type;
        locationRepository = ApplicationContextProvider.getContext().getBean(LocationRepository.class);
    }

    public LocationBuilder copy(LocationContract locationRequest) throws BuilderException {
        get().setUuid(locationRequest.getUuid() == null ? UUID.randomUUID().toString() : locationRequest.getUuid());
        get().setTitle(locationRequest.getName());
        get().setType(type);
        get().setLevel(type.getLevel());
        get().setVoided(locationRequest.isVoided());
        withParentLocation(locationRequest);
        return this;
    }

    private LocationBuilder withParentLocation(LocationContract locationRequest) {
        ReferenceDataContract parentLocation = locationRequest.getParent();
        if (parentLocation != null) {
            if (parentLocation.getUuid() != null) {
                get().setParentLocationMapping(fetchOrCreateLocationMapping(get(), parentLocation));
                get().setParent(locationRepository.findByUuid(parentLocation.getUuid()));
            } else if (parentLocation.getId() != null) {
                get().setParentLocationMapping(fetchOrCreateLocationMapping(get(), parentLocation));
                get().setParent(locationRepository.findOne(parentLocation.getId()));
            }
        }
        return this;
    }

    private ParentLocationMapping fetchOrCreateLocationMapping(AddressLevel existing, ReferenceDataContract parentLocationContract) {
        ParentLocationMapping locationMapping = existing.getParentLocationMapping();
        if (locationMapping == null) {
            locationMapping = new ParentLocationMapping();
            locationMapping.assignUUID();
        }
        AddressLevel parentLocation = parentLocationContract.getUuid() != null 
            ? locationRepository.findByUuid(parentLocationContract.getUuid()) 
            : locationRepository.findOne(parentLocationContract.getId());
        if (parentLocation == null) {
            String message = String.format("Parent Location not found for UUID:%s Id: %d", parentLocationContract.getUuid(), parentLocationContract.getId());
            throw new ValidationException(message);
        }
        locationMapping.setParentLocation(parentLocation);
        locationMapping.setVoided(parentLocationContract.isVoided());
        return locationMapping;
    }

    private String cleanAddressTitle(String address) {
        String normalized = address.trim().replaceAll("\\s+", "_").replaceAll("[^a-zA-Z0-9_]", "");
        return "".equals(normalized) ? "_" : normalized;
    }
}
