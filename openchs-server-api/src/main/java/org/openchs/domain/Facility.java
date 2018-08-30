package org.openchs.domain;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

@Entity
@Table(name = "facility")
public class Facility extends OrganisationAwareEntity {
    @NotNull
    private String name;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "address_id")
    private AddressLevel addressLevel;

    public AddressLevel getAddressLevel() {
        return addressLevel;
    }

    public void setAddressLevel(AddressLevel addressLevel) {
        this.addressLevel = addressLevel;
    }


    public static Facility create(String name, AddressLevel address) {
        Facility facility = new Facility();
        facility.name = name;
        facility.addressLevel = address;
        return facility;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}