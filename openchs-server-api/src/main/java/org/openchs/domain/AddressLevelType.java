package org.openchs.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.hibernate.annotations.BatchSize;

import javax.persistence.*;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(name = "address_level_type")
@BatchSize(size = 100)
@JsonIgnoreProperties({"addressLevels"})
public class AddressLevelType extends OrganisationAwareEntity {
    @Column(name = "name", nullable = false)
    private String name;

    private Double level;

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "type")
    private Set<AddressLevel> addressLevels = new LinkedHashSet<>();

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

    public Double getLevel() {
        return level;
    }

    public void setLevel(Double level) {
        this.level = level;
    }
}
