package org.avni.server.web.request;

import org.avni.server.domain.AddressLevelType;

public class AddressLevelTypeContract extends ReferenceDataContract {
    private Double level;
    private ReferenceDataContract parent;
    private Long parentId;

    public Double getLevel() {
        return level;
    }

    public void setLevel(Double level) {
        this.level = level;
    }

    public ReferenceDataContract getParent() {
        return parent;
    }

    public void setParent(ReferenceDataContract parent) {
        this.parent = parent;
    }

    public Long getParentId() {
        return parentId;
    }

    public void setParentId(Long parentId) {
        this.parentId = parentId;
    }

    public static AddressLevelTypeContract fromAddressLevelType(AddressLevelType addressLevelType) {
        AddressLevelTypeContract contract = new AddressLevelTypeContract();
        contract.setId(addressLevelType.getId());
        contract.setUuid(addressLevelType.getUuid());
        contract.setName(addressLevelType.getName());
        contract.setLevel(addressLevelType.getLevel());
        contract.setVoided(addressLevelType.isVoided());
        AddressLevelType parent = addressLevelType.getParent();
        if (parent != null) {
            ReferenceDataContract parentContract = new ReferenceDataContract();
            parentContract.setUuid(parent.getUuid());
            contract.setParent(parentContract);
        }
        return contract;
    }
}
