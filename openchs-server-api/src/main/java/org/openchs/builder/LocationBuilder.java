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

import java.util.List;
import java.util.stream.Collectors;

public class LocationBuilder extends BaseBuilder<AddressLevel, LocationBuilder> {

    private final AddressLevelType type;
    private LocationRepository locationRepository;

    public LocationBuilder(AddressLevel existingEntity, AddressLevelType type) {
        super(existingEntity, new AddressLevel());
        this.type = type;
        locationRepository = ApplicationContextProvider.getContext().getBean(LocationRepository.class);
    }

    public LocationBuilder copy(LocationContract locationRequest) throws BuilderException {
        String location = cleanAddressTitle(locationRequest.getName());
        get().setUuid(locationRequest.getUuid());
        get().setTitle(locationRequest.getName());
        get().setType(type);
        get().setLevel(locationRequest.getLevel());
        if (locationRequest.getParents().size() > 0) {
            List<ParentLocationMapping> mappings = locationRequest.getParents().stream()
                    .map(parentLocationContract -> fetchOrCreateLocationMapping(get(), parentLocationContract))
                    .collect(Collectors.toList());
            get().addAll(mappings);
            //Right now we have only one parent for child address in parents array object
            AddressLevel parentAddressLevel = mappings.size() > 0 ? locationRepository.findByUuid(mappings.get(0).getParentLocation().getUuid()) : null;
            String lineage = parentAddressLevel == null ? location : parentAddressLevel.getLineage() + "." + location;
            get().setLineage(lineage);
        } else {
            ReferenceDataContract parentLocation = locationRequest.getParent();
            if (parentLocation != null && parentLocation.getUuid() != null && locationRepository.findByUuid(parentLocation.getUuid()) == null) {
                throw new ValidationException(String.format("Location not found for UUID:%s", locationRequest.getParent().getUuid()));
            }
            String lineage = parentLocation == null || parentLocation.getUuid() == null ? location :
                    locationRepository.findByUuid(locationRequest.getParent().getUuid()).getLineage() + "." + location;
            get().setLineage(lineage);
        }
        return this;
    }

    private ParentLocationMapping fetchOrCreateLocationMapping(AddressLevel existing, LocationContract parentLocationContract) {
        if (StringUtils.isEmpty(parentLocationContract.getUuid())) {
            throw new ValidationException("UUID missing for answer");
        }
        ParentLocationMapping locationMapping = existing.findLocationMappingByParentLocationUUID(parentLocationContract.getUuid());
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
