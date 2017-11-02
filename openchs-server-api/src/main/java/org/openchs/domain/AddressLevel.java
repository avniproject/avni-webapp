package org.openchs.domain;

import org.hibernate.annotations.Type;
import org.openchs.application.KeyValues;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "address_level")
public class AddressLevel extends OrganisationAwareEntity {
    @Column
    @NotNull
    private String title;

    @Column
    @NotNull
    private int level;

    @Column(name = "attributes")
    @Type(type = "keyValues")
    private KeyValues attributes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private AddressLevel parentAddressLevel;

    @ManyToMany(cascade = CascadeType.ALL)
    @JoinTable(name = "catchment_address_mapping", joinColumns = {@JoinColumn(name = "addresslevel_id")}, inverseJoinColumns = {@JoinColumn(name = "catchment_id")})
    private Set<Catchment> catchments = new HashSet<Catchment>();

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public int getLevel() {
        return level;
    }

    public void setLevel(int level) {
        this.level = level;
    }

    public AddressLevel getParentAddressLevel() {
        return parentAddressLevel;
    }

    public void setParentAddressLevel(AddressLevel parentAddressLevel) {
        this.parentAddressLevel = parentAddressLevel;
    }

    public Set<Catchment> getCatchments() {
        return catchments;
    }

    public void setCatchments(Set<Catchment> catchments) {
        this.catchments = catchments;
    }


    public void addCatchment(Catchment catchment) {
        catchments.add(catchment);
    }

    public void removeCatchment(Catchment catchment) {
        catchments.remove(catchment);
    }

    public KeyValues getAttributes() {
        return attributes;
    }

    public void setAttributes(KeyValues attributes) {
        this.attributes = attributes;
    }
}