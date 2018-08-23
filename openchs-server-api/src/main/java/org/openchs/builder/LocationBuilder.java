package org.openchs.builder;

import org.openchs.dao.LocationRepository;
import org.openchs.domain.AddressLevel;
import org.openchs.domain.ParentLocationMapping;
import org.openchs.framework.ApplicationContextProvider;
import org.openchs.web.request.LocationContract;
import org.openchs.web.validation.ValidationException;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

public class LocationBuilder extends BaseBuilder<AddressLevel, LocationBuilder> {

    private LocationRepository locationRepository;

    public LocationBuilder(AddressLevel existingEntity) {
        super(existingEntity, new AddressLevel());
        locationRepository = ApplicationContextProvider.getContext().getBean(LocationRepository.class);
    }

    public LocationBuilder copy(LocationContract locationRequest) throws LocationBuilderException {
        get().setUuid(locationRequest.getUuid());
        get().setTitle(locationRequest.getName());
        get().setType(locationRequest.getType());
        get().setLevel(locationRequest.getLevel());
        List<ParentLocationMapping> mappings = locationRequest.getParents().stream()
                .map(parentLocationContract -> fetchOrCreateLocationMapping(get(), parentLocationContract))
                .collect(Collectors.toList());
        get().addAll(mappings);
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
}
