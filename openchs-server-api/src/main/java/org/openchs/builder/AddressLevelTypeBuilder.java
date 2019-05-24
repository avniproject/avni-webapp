package org.openchs.builder;

import org.openchs.dao.LocationRepository;
import org.openchs.domain.AddressLevel;
import org.openchs.domain.AddressLevelType;
import org.openchs.domain.ParentLocationMapping;
import org.openchs.framework.ApplicationContextProvider;
import org.openchs.web.request.AddressLevelTypeContract;
import org.openchs.web.request.LocationContract;
import org.openchs.web.request.ReferenceDataContract;
import org.openchs.web.validation.ValidationException;
import org.springframework.util.StringUtils;

import java.util.UUID;

public class AddressLevelTypeBuilder extends BaseBuilder<AddressLevelType, AddressLevelTypeBuilder> {

    public AddressLevelTypeBuilder(AddressLevelType existingEntity) {
        super(existingEntity, new AddressLevelType());
    }

    public AddressLevelTypeBuilder copy(AddressLevelTypeContract addressLevelTypeContract) {
        get().setUuid(addressLevelTypeContract.getUuid());
        get().setName(addressLevelTypeContract.getName());
        get().setLevel(addressLevelTypeContract.getLevel());
        return this;
    }
}
