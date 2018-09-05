package org.openchs.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.joda.time.DateTime;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

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
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "catchment_id")
    private Catchment catchment;

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
        this.userFacilityMappings.add(userFacilityMapping);
    }

    public void addUserFacilityMappings(List<UserFacilityMapping> userFacilityMappings) {
        userFacilityMappings.forEach(this::addUserFacilityMapping);
    }
}