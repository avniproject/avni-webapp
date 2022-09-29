package org.avni.server.domain;

import com.fasterxml.jackson.annotation.*;
import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.Immutable;
import org.hibernate.annotations.Type;
import org.avni.server.application.projections.BaseProjection;
import org.avni.server.geo.Point;
import org.springframework.data.rest.core.config.Projection;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Entity
@Table(name = "address_level")
@BatchSize(size = 100)
@JsonIgnoreProperties({
        "parentLocationMappings", "type", "catchments", "virtualCatchments",
        "parent", "subLocations"
})
public class AddressLevel extends OrganisationAwareEntity {
    @Column
    @NotNull
    private String title;

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
    @Type(type = "org.avni.server.ltree.LTreeType")
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

    @Column
    @Type(type = "observations")
    private ObservationCollection locationProperties;

    @Type(type = "org.avni.server.geo.PointType")
    @Column
    private Point gpsCoordinates;

    private String legacyId;

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public Double getLevel() {
        return this.getType().getLevel();
    }

    public AddressLevel getParent() {
        return parent;
    }

    public Long getParentId() {
        return parent != null ? parent.getId() : null;
    }

    public String  getParentUuid() {
        return parent == null ? null : parent.getUuid();
    }

    public String getTypeUuid() {
        return this.getType().getUuid();
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

    public boolean containsSubLocationExcept(String title, AddressLevelType type, AddressLevel exclude) {
        return null !=
                subLocations
                        .stream()
                        .filter(location -> !location.getId().equals(exclude.getId()))
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
        AddressLevel parentLocation = parentLocationMappings.stream()
                .map(it -> it.getParentLocation())
                .filter(Objects::nonNull)
                .findFirst().orElse(null);
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

    public Long getParentTypeId() {
        return this.parent != null ? this.parent.getType().getId() : null;
    }

    public Long getTypeId() {
        return this.type != null ? this.type.getId() : null;
    }

    public ObservationCollection getLocationProperties() {
        return locationProperties;
    }

    public void setLocationProperties(ObservationCollection locationProperties) {
        this.locationProperties = locationProperties;
    }

    public Point getGpsCoordinates() {
        return gpsCoordinates;
    }

    public void setGpsCoordinates(Point gpsCoordinates) {
        this.gpsCoordinates = gpsCoordinates;
    }

    public String getLegacyId() {
        return legacyId;
    }

    public void setLegacyId(String legacyId) {
        this.legacyId = legacyId;
    }

    @Projection(name = "AddressLevelProjection", types = {AddressLevel.class})
    public interface AddressLevelProjection extends BaseProjection {
        String getTitle();

        AddressLevelProjection getParentLocation();

    }
}
