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

public class LocationBuilder extends BaseBuilder<AddressLevel, LocationBuilder> {

    private final AddressLevelType type;
    private LocationRepository locationRepository;

    public LocationBuilder(AddressLevel existingEntity, AddressLevelType type) {
        super(existingEntity, new AddressLevel());
        this.type = type;
        locationRepository = ApplicationContextProvider.getContext().getBean(LocationRepository.class);
    }

    public LocationBuilder copy(LocationContract locationRequest) throws BuilderException {
        get().setUuid(locationRequest.getUuid());
        get().setTitle(locationRequest.getName());
        get().setType(type);
        get().setLevel(locationRequest.getLevel());
        withParentLocation(locationRequest);
        withLineage(locationRequest);
        return this;
    }

    private LocationBuilder withParentLocation(LocationContract locationRequest) {
        ReferenceDataContract parentLocation = locationRequest.getParent();
        if (parentLocation != null && parentLocation.getUuid() != null) {
            get().setParentLocationMapping(fetchOrCreateLocationMapping(get(), parentLocation));
        }
        return this;
    }

    private LocationBuilder withLineage(LocationContract locationRequest) {
        ReferenceDataContract parentLocation = locationRequest.getParent();
        String locationTitleNormalized = cleanAddressTitle(locationRequest.getName());
        String parentLineage = parentLocation != null && parentLocation.getUuid() != null ?
                locationRepository.findByUuid(parentLocation.getUuid()).getLineage() + "." : "";
        get().setLineage(parentLineage + locationTitleNormalized);
        return this;
    }

    private ParentLocationMapping fetchOrCreateLocationMapping(AddressLevel existing, ReferenceDataContract parentLocationContract) {
        if (StringUtils.isEmpty(parentLocationContract.getUuid())) {
            throw new ValidationException("UUID missing for answer");
        }
        ParentLocationMapping locationMapping = existing.getParentLocationMapping();
        if (locationMapping == null) {
            locationMapping = new ParentLocationMapping();
            locationMapping.assignUUID();
        }
        AddressLevel parentLocation = locationRepository.findByUuid(parentLocationContract.getUuid());
        if (parentLocation == null) {
            String message = String.format("Location not found for UUID:%s", parentLocationContract.getUuid());
            throw new ValidationException(message);
        }
        locationMapping.setParentLocation(parentLocation);
        locationMapping.setVoided(parentLocationContract.isVoided());
        return locationMapping;
    }

    private String cleanAddressTitle(String address) {
        return address.replaceAll("\\s", "_").replaceAll("[^a-zA-Z0-9_]", "");
    }
}
