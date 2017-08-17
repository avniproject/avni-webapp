package org.openchs.domain;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "catchment")
public class Catchment extends CHSEntity {

    @Column
    @NotNull
    private String name;

    @ManyToMany(mappedBy = "catchments")
    private Set<AddressLevel> addressLevels = new HashSet<>();


    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Set<AddressLevel> getAddressLevels() {
        return addressLevels;
    }

    public void setAddressLevels(Set<AddressLevel> addressLevels) {
        this.addressLevels = addressLevels;
    }

    public AddressLevel findAddressLevel(String addressLevelUUID) {
        return addressLevels.stream().filter(x -> x.getUuid().equals(addressLevelUUID)).findAny().orElse(null);
    }

    public void addAddressLevel(AddressLevel addressLevel) {
        addressLevels.add(addressLevel);
        addressLevel.addCatchment(this);
    }


    public void remove(AddressLevel addressLevel) {
        addressLevels.remove(addressLevel);
        addressLevel.removeCatchment(this);
    }
}