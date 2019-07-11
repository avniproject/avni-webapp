package org.openchs.domain;

import com.fasterxml.jackson.annotation.*;
import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.Immutable;
import org.hibernate.annotations.Type;
import org.openchs.application.projections.BaseProjection;
import org.springframework.data.rest.core.config.Projection;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Entity
@Table(name = "address_level")
@BatchSize(size = 100)
@JsonIgnoreProperties({
        "parentLocationMappings", "type", "catchments", "virtualCatchments",
        "parent", "subLocations", "titleLineage"
})
@SecondaryTable(name="title_lineage_locations_view",
    pkJoinColumns = @PrimaryKeyJoinColumn(name = "lowestpoint_id", referencedColumnName = "id"))
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

    @ManyToOne(cascade = {CascadeType.ALL})
    @JoinColumn(name = "parent_id")
    private AddressLevel parent;

    @OneToMany(mappedBy = "parent")
    private Set<AddressLevel> subLocations = new HashSet<>();

    @Column(unique = true)
    @Type(type = "org.openchs.ltree.LTreeType")
    private String lineage;

    @Transient
    private String typeString;

    @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, mappedBy = "location")
    private Set<ParentLocationMapping> parentLocationMappings = new HashSet<>();

    @ManyToMany(cascade = CascadeType.ALL)
    @JoinTable(name = "catchment_address_mapping", joinColumns = {@JoinColumn(name = "addresslevel_id")}, inverseJoinColumns = {@JoinColumn(name = "catchment_id")})
    private Set<Catchment> catchments = new HashSet<>();

    @ManyToMany()
    @Immutable
    @JoinTable(name = "virtual_catchment_address_mapping_table", joinColumns = {@JoinColumn(name = "addresslevel_id")}, inverseJoinColumns = {@JoinColumn(name = "catchment_id")})
    private Set<Catchment> virtualCatchments = new HashSet<>();

    @Column(table = "title_lineage_locations_view", name = "title_lineage")
    private String titleLineage;

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

    public AddressLevel getParent() {
        return parent;
    }

    public Long getParentId() {
        return parent != null ? parent.getId() : null;
    }

    public void setParent(AddressLevel parent) {
        this.parent = parent;
    }

    public boolean isTopLevel() {
        return parent == null;
    }

    public Set<AddressLevel> getSubLocations() {
        return subLocations;
    }

    @JsonIgnore
    public Set<AddressLevel> getNonVoidedSubLocations() {
        return subLocations.stream()
                .filter(location -> !location.isVoided())
                .collect(Collectors.toSet());
    }

    public void setSubLocations(Set<AddressLevel> subLocations) {
        this.subLocations = subLocations;
    }

    public boolean containsSubLocation(String title, AddressLevelType type) {
        return null !=
                subLocations
                        .stream()
                        .filter(location -> location.getTitle().equals(title) &&
                                location.getType().equals(type)
                        ).findFirst()
                        .orElse(null);
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

    public void setParentLocationMapping(ParentLocationMapping parentLocationMapping) {
        AddressLevel parentLocation = parentLocationMappings.stream().map(it -> it.getParentLocation()).findFirst().orElse(null);
        if (!parentLocationMapping.getParentLocation().equals(parentLocation)) {
            parentLocationMappings.add(parentLocationMapping);
            parentLocationMapping.setLocation(this);
        }
    }

    @JsonIgnore
    public ParentLocationMapping getParentLocationMapping() {
        return this.parentLocationMappings.stream().findFirst().orElse(null);
    }

    @JsonIgnore
    public AddressLevel getParentLocation() {
        return getParentLocationMapping() != null ? getParentLocationMapping().getParentLocation() : null;
    }

    public String getLineage() {
        return lineage;
    }

    public void setLineage(String lineage) {
        this.lineage = lineage;
    }

    public String getTitleLineage() {
        return titleLineage;
    }

    public void setTitleLineage(String titleLineage) {
        this.titleLineage = titleLineage;
    }

    @Projection(name = "AddressLevelProjection", types = {AddressLevel.class})
    public interface AddressLevelProjection extends BaseProjection {
        String getTitle();

        AddressLevelProjection getParentLocation();

        String getTitleLineage();
    }
}
