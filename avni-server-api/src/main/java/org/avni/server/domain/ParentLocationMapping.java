package org.avni.server.domain;

import org.hibernate.annotations.BatchSize;

import javax.persistence.*;

@Entity
@Table(name = "location_location_mapping")
@BatchSize(size = 100)
public class ParentLocationMapping extends OrganisationAwareEntity {
//    @JsonIgnore
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "location_id")
    private AddressLevel location;

//    @NotNull
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "parent_location_id")
    private AddressLevel parentLocation;

    public AddressLevel getLocation() {
        return location;
    }

    public void setLocation(AddressLevel location) {
        this.location = location;
    }

    public AddressLevel getParentLocation() {
        return parentLocation;
    }

    public void setParentLocation(AddressLevel parentLocation) {
        this.parentLocation = parentLocation;
    }
}
