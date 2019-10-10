package org.openchs.web.request;

import org.openchs.domain.AddressLevel;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

public class LocationContract extends ReferenceDataContract {
    private Double level;
    private ReferenceDataContract parent;
    @Deprecated
    private List<LocationContract> parents;
    private String type;
    private String organisationUUID;
    private String addressLevelTypeUUID;

    public Double getLevel() {
        return level;
    }

    public void setLevel(Double level) {
        this.level = level;
    }

    public String getType() {
        return type != null ? StringUtils.capitalize(type.trim().toLowerCase()) : null;
    }

    public void setType(String type) {
        this.type = type;
    }

    public List<LocationContract> getParents() {
        if (parents == null) {
            return parents = new ArrayList<>();
        }
        return parents;
    }

    public void setParents(List<LocationContract> parents) {
        this.parents = parents;
    }

    public void setParent(ReferenceDataContract parent) {
        this.parent = parent;
    }

    public String getOrganisationUUID() {
        return organisationUUID;
    }

    public void setOrganisationUUID(String organisationUUID) {
        this.organisationUUID = organisationUUID;
    }

    public ReferenceDataContract getParent() {
        if (null != parent) {
            return parent;
        } else {
            return getParents().stream().findFirst().orElse(null);
        }
    }

    public String getAddressLevelTypeUUID() {
        return addressLevelTypeUUID;
    }

    public void setAddressLevelTypeUUID(String addressLevelTypeUUID) {
        this.addressLevelTypeUUID = addressLevelTypeUUID;
    }

    public static LocationContract fromAddressLevel(AddressLevel addressLevel) {
        LocationContract contract = new LocationContract();
        contract.setUuid(addressLevel.getUuid());
        contract.setName(addressLevel.getTitle());
        contract.setAddressLevelTypeUUID(addressLevel.getType().getUuid());
        contract.setVoided(addressLevel.isVoided());
        AddressLevel parent = addressLevel.getParent();
        if (parent != null) {
            ReferenceDataContract parentContract = new ReferenceDataContract();
            parentContract.setUuid(parent.getUuid());
            contract.setParent(parentContract);
        }
        return contract;
    }
}
