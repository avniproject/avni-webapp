package org.openchs.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.hibernate.annotations.BatchSize;

import javax.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "address_level_type")
@BatchSize(size = 100)
@JsonIgnoreProperties({"subTypes"})
public class AddressLevelType extends OrganisationAwareEntity {
    @Column(name = "name", nullable = false)
    private String name;

    private Double level;

    @ManyToOne(cascade = {CascadeType.ALL})
    private AddressLevelType parent;

    @OneToMany(mappedBy = "parent")
    private Set<AddressLevelType> subTypes = new HashSet<>();

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Double getLevel() {
        return level;
    }

    public void setLevel(Double level) {
        this.level = level;
    }

    public AddressLevelType getParent() {
        return parent;
    }

    public void setParent(AddressLevelType parent) {
        this.parent = parent;
    }

    public Long getParentId() {
        return parent == null ? null : parent.getId();
    }

    public Set<AddressLevelType> getSubTypes() {
        return subTypes;
    }

    public void setSubTypes(Set<AddressLevelType> subTypes) {
        this.subTypes = subTypes;
    }

    public Boolean isVoidable() {
        return subTypes.stream().allMatch(CHSEntity::isVoided);
    }
}
