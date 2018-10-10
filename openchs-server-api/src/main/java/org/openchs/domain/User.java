package org.openchs.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.joda.time.DateTime;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.*;

@Entity
@Table(name = "users")
public class User {
    @Column
    @NotNull
    private String name;

    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false, nullable = false)
    @Id
    private Long id;

    @Column
    @NotNull
    private String uuid;

    @Column
    private Long organisationId;

    // Audit is not getting used for managing users because, the application goes in a loop managing audit information generically and automatically assigning the user to the entities
    @JoinColumn(name = "created_by_id")
    @ManyToOne(targetEntity = User.class)
    private User createdBy;

    @NotNull
    private DateTime createdDateTime;

    @JoinColumn(name = "last_modified_by_id")
    @ManyToOne(targetEntity = User.class)
    private User lastModifiedBy;

    @NotNull
    private DateTime lastModifiedDateTime;

    @OneToMany(fetch = FetchType.EAGER, cascade = CascadeType.ALL, mappedBy = "user")
    private Set<UserFacilityMapping> userFacilityMappings = new HashSet<>();

    @Column
    private boolean isOrgAdmin;
    @Column
    private boolean isAdmin;

    @NotNull
    @ManyToOne
    @JoinColumn(name = "catchment_id")
    private Catchment catchment;

    @NotNull
    @Column(name = "operating_individual_scope")
    @Enumerated(value = EnumType.STRING)
    private OperatingIndividualScope operatingIndividualScope;

    public static final String USER = "user";
    public static final String ORGANISATION_ADMIN = "organisation_admin";
    public static final String ADMIN = "admin";

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public static User newUser(String name, Long orgId) {
        User user = new User();
        user.setName(name);
        user.setOrganisationId(orgId);
        user.setUuid(UUID.randomUUID().toString());
        return user;
    }

    public Long getOrganisationId() {
        return organisationId;
    }

    public void setOrganisationId(Long organisationId) {
        this.organisationId = organisationId;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUuid() {
        return uuid;
    }

    public void setUuid(String uuid) {
        this.uuid = uuid;
    }

    @NotNull
    public Catchment getCatchment() {
        return catchment;
    }

    public void setCatchment(@NotNull Catchment catchment) {
        this.catchment = catchment;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        User other = (User) o;

        if (id != null ? !id.equals(other.id) : other.id != null) return false;
        return uuid != null ? uuid.equals(other.uuid) : other.uuid == null;
    }

    @Override
    public int hashCode() {
        int result = id != null ? id.hashCode() : 0;
        result = 31 * result + (uuid != null ? uuid.hashCode() : 0);
        return result;
    }

    @JsonIgnore
    public boolean isNew() {
        Long id = this.getId();
        return (id == null || id == 0);
    }

    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
    }

    public void setCreatedDateTime(DateTime createdDateTime) {
        this.createdDateTime = createdDateTime;
    }

    public void setLastModifiedBy(User lastModifiedBy) {
        this.lastModifiedBy = lastModifiedBy;
    }

    public void setLastModifiedDateTime(DateTime lastModifiedDateTime) {
        this.lastModifiedDateTime = lastModifiedDateTime;
    }

    public Set<UserFacilityMapping> getUserFacilityMappings() {
        return userFacilityMappings;
    }

    public void addUserFacilityMapping(UserFacilityMapping userFacilityMapping) {
        if (this.userFacilityMappings == null)
            this.userFacilityMappings = new HashSet<>();
        userFacilityMapping.setUser(this);
        this.userFacilityMappings.add(userFacilityMapping);
    }

    public void addUserFacilityMappings(List<UserFacilityMapping> userFacilityMappings) {
        userFacilityMappings.forEach(this::addUserFacilityMapping);
    }

    public User getCreatedBy() {
        return createdBy;
    }

    @NotNull
    public DateTime getCreatedDateTime() {
        return createdDateTime;
    }

    public User getLastModifiedBy() {
        return lastModifiedBy;
    }

    @NotNull
    public DateTime getLastModifiedDateTime() {
        return lastModifiedDateTime;
    }

    public String[] getRoles() {
        ArrayList<String> roles = new ArrayList<>();
        roles.add(USER);
        if (this.isAdmin) roles.add(ADMIN);
        if (this.isOrgAdmin) roles.add(ORGANISATION_ADMIN);
        return roles.toArray(new String[0]);
    }

    public void setOrgAdmin(boolean orgAdmin) {
        isOrgAdmin = orgAdmin;
    }

    public void setAdmin(boolean admin) {
        isAdmin = admin;
    }

    public boolean isAdmin() {
        return isAdmin;
    }

    @NotNull
    public OperatingIndividualScope getOperatingIndividualScope() {
        return operatingIndividualScope;
    }

    public void setOperatingIndividualScope(@NotNull OperatingIndividualScope operatingIndividualScope) {
        this.operatingIndividualScope = operatingIndividualScope;
    }

    public Facility getFacility() {
        Set<UserFacilityMapping> userFacilityMappings = getUserFacilityMappings();
        if (userFacilityMappings.size() > 1) {
            throw new AssertionError("User cannot belong to more than one facility yet");
        } else if (userFacilityMappings.size() == 1) {
            return userFacilityMappings.stream().findFirst().get().getFacility();
        }
        return null;
    }
}