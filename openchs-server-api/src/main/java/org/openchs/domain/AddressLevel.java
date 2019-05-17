package org.openchs.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.Immutable;
import org.hibernate.annotations.Type;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Entity
@Table(name = "address_level")
@BatchSize(size = 100)
@JsonIgnoreProperties({"parentLocationMappings", "type", "catchments", "virtualCatchments"})
public class AddressLevel extends OrganisationAwareEntity {
    @Column
    @NotNull
    private String title;

    @Column
    @NotNull
    private Double level;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "type_id")
    private AddressLevelType type;

    @Column(unique=true)
    @NotNull
    @Type(type = "org.openchs.ltree.LTreeType")
    private String lineage;

    @Transient
    private String typeString;

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

    public Double getLevel() {
        return level;
    }

    public void setLevel(Double level) {
        this.level = level;
    }

    public Set<Catchment> getCatchments() {
        return catchments;
    }

    public void setCatchments(Set<Catchment> catchments) {
        this.catchments = catchments;
    }

    public AddressLevelType getType() {
        return type;
    }

    public void setType(AddressLevelType type) {
        this.type = type;
    }

    public String getTypeString() {
        return this.type.getName();
    }

    public void setTypeString(String typeString) {
        this.typeString = typeString;
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

    public String getLineage() {
        return lineage;
    }

    public void setLineage(String lineage) {
        this.lineage = lineage;
    }
}
