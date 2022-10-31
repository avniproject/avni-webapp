package org.avni.server.domain;

import org.hibernate.annotations.BatchSize;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "catchment")
@BatchSize(size = 100)
public class Catchment extends OrganisationAwareEntity {

    @Column
    @NotNull
    private String name;

    @ManyToMany(mappedBy = "catchments", fetch = FetchType.LAZY)
    private Set<AddressLevel> addressLevels = new HashSet<>();

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Set<AddressLevel> getAddressLevels() {
        if (addressLevels == null) addressLevels = new HashSet<>();
        return addressLevels;
    }

    public void setAddressLevels(Set<AddressLevel> addressLevels) {
        this.addressLevels = addressLevels;
    }

    public AddressLevel findAddressLevel(String addressLevelUUID) {
        return getAddressLevels().stream().filter(x -> x.getUuid().equals(addressLevelUUID)).findAny().orElse(null);
    }

    public void clearAddressLevels() {
        for (AddressLevel addressLevel : getAddressLevels()) {
            addressLevel.removeCatchment(this);
        }
        getAddressLevels().clear();
    }

    public void addAddressLevel(AddressLevel addressLevel) {
        getAddressLevels().add(addressLevel);
        addressLevel.addCatchment(this);
    }

    public void removeAddressLevel(AddressLevel addressLevel) {
        getAddressLevels().remove(addressLevel);
        addressLevel.removeCatchment(this);
    }
}
