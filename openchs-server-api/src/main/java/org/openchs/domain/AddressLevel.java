package org.openchs.domain;

import org.hibernate.annotations.Immutable;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Entity
@Table(name = "address_level")
public class AddressLevel extends OrganisationAwareEntity {
    @Column
    @NotNull
    private String title;

    @Column
    @NotNull
    private int level;

    @Column(name = "type", nullable = true)
    private String type;

    @OneToMany(fetch = FetchType.EAGER, cascade = CascadeType.ALL, mappedBy = "location")
    private Set<ParentLocationMapping> parentLocationMappings = new HashSet<>();

    @ManyToMany(cascade = CascadeType.ALL)
    @JoinTable(name = "catchment_address_mapping", joinColumns = {@JoinColumn(name = "addresslevel_id")}, inverseJoinColumns = {@JoinColumn(name = "catchment_id")})
    private Set<Catchment> catchments = new HashSet<>();

    @ManyToMany()
    @Immutable
    @JoinTable(name = "virtual_catchment_address_mapping_table", joinColumns = {@JoinColumn(name = "addresslevel_id")}, inverseJoinColumns = {@JoinColumn(name = "catchment_id")})
    private Set<Catchment> virtualCatchments = new HashSet<>();

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

    public Set<Catchment> getCatchments() {
        return catchments;
    }

    public void setCatchments(Set<Catchment> catchments) {
        this.catchments = catchments;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public void addCatchment(Catchment catchment) {
        catchments.add(catchment);
    }

    public void removeCatchment(Catchment catchment) {
        catchments.remove(catchment);
    }

    public Set<ParentLocationMapping> getParentLocationMappings() {
        return parentLocationMappings;
    }

    public void setParentLocationMappings(Set<ParentLocationMapping> parentLocationMappings) {
        this.parentLocationMappings = parentLocationMappings;
    }

    public Set<Catchment> getVirtualCatchments() {
        return virtualCatchments;
    }

    public void setVirtualCatchments(Set<Catchment> virtualCatchments) {
        this.virtualCatchments = virtualCatchments;
    }

    public void addAll(List<ParentLocationMapping> parentLocationMappings) {
        List<ParentLocationMapping> nonRepeatingNewOnes = parentLocationMappings.stream().filter(parentLocationMapping ->
                this.getParentLocationMappings().stream().noneMatch(oldMapping ->
                        oldMapping.getParentLocation().equals(parentLocationMapping.getParentLocation())
                )).collect(Collectors.toList());
        this.getParentLocationMappings().addAll(nonRepeatingNewOnes);
        nonRepeatingNewOnes.forEach(locationMapping -> locationMapping.setLocation(this));
    }

    public ParentLocationMapping findLocationMappingByParentLocationUUID(String uuid) {
        return parentLocationMappings.stream().filter(parentLocationMapping -> parentLocationMapping.getParentLocation().getUuid().equals(uuid)).findFirst().orElse(null);
    }
}