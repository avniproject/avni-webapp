package org.openchs.web.request;

import org.openchs.domain.Catchment;
import org.springframework.hateoas.core.Relation;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Relation(collectionRelation = "catchment")
public class CatchmentContract extends ReferenceDataContract {
    private Long id;

    private List<Long> locationIds;

    private String type;

    private List<AddressLevelContract> locations = new ArrayList<>();

    public List<AddressLevelContract> getLocations() {
        return locations;
    }

    public void setLocations(List<AddressLevelContract> locations) {
        this.locations = locations;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public static CatchmentContract fromEntity(Catchment catchment) {
        CatchmentContract catchmentContract = new CatchmentContract();
        catchmentContract.setId(catchment.getId());
        catchmentContract.setUuid(catchment.getUuid());
        catchmentContract.setType(catchment.getType());
        catchmentContract.setName(catchment.getName());
        catchmentContract.setLocationIds(catchment.getAddressLevels().stream().map(addressLevel -> addressLevel.getId()).collect(Collectors.toList()));
        return catchmentContract;
    }

    @Override
    public String toString() {
        return String.format("UUID: %s, Name: %s", this.getUuid(), this.getName());
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public List<Long> getLocationIds() {
        return locationIds;
    }

    public void setLocationIds(List<Long> locationIds) {
        this.locationIds = locationIds;
    }
}
