package org.openchs.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.apache.commons.validator.routines.EmailValidator;
import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.Type;
import org.joda.time.DateTime;
import org.openchs.web.validation.ValidationException;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.*;

@Entity
@Table(name = "users")
@BatchSize(size = 100)
public class User {
    public static String MOBILE_NUMBER_PATTERN = "^\\+91[0-9]{10}";

    @Column
    @NotNull
    private String username;

    @Column
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

    @Column
    private String email;

    @Column
    private String phoneNumber;

    @Column
    private boolean disabledInCognito;

    // Audit is not getting used for managing users because, the application goes in a loop managing audit information generically and automatically assigning the user to the entities
    @JsonIgnore
    @JoinColumn(name = "created_by_id")
    @ManyToOne(targetEntity = User.class)
    private User createdBy;

    @NotNull
    private DateTime createdDateTime;

    @JsonIgnore
    @JoinColumn(name = "last_modified_by_id")
    @ManyToOne(targetEntity = User.class)
    private User lastModifiedBy;

    @NotNull
    private DateTime lastModifiedDateTime;

    @Column
    private boolean isVoided;

    @OneToMany(fetch = FetchType.EAGER, cascade = CascadeType.ALL, mappedBy = "user")
    private Set<UserFacilityMapping> userFacilityMappings = new HashSet<>();

    @Column
    private boolean isOrgAdmin;

    @JsonIgnore
    @OneToMany(fetch = FetchType.EAGER, cascade = CascadeType.ALL, mappedBy = "user")
    private Set<AccountAdmin> accountAdmin = new HashSet<>();;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "catchment_id")
    private Catchment catchment;

    @NotNull
    @Column(name = "operating_individual_scope")
    @Enumerated(value = EnumType.STRING)
    private OperatingIndividualScope operatingIndividualScope;

    @Column
    @Type(type = "jsonObject")
    private JsonObject settings;

    public static final String USER = "user";
    public static final String ORGANISATION_ADMIN = "organisation_admin";
    public static final String ADMIN = "admin";

    public String getUsername() { return username; }

    public void setUsername(String username) { this.username = username; }

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

    public String getEmail() { return email; }

    public void setEmail(String email) { this.email = email; }

    public String getPhoneNumber() { return phoneNumber; }

    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public boolean isDisabledInCognito() {
        return disabledInCognito;
    }

    public void setDisabledInCognito(boolean disabledInCognito) {
        this.disabledInCognito = disabledInCognito;
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

    public Catchment getCatchment() {
        return catchment;
    }

    public Optional<Long> getCatchmentId() {
        return Optional.ofNullable(catchment != null ? catchment.getId() : null);
    }

    public void setCatchment(@NotNull Catchment catchment) {
        this.catchment = catchment;
    }

    public Boolean isVoided() {
        return isVoided;
    }

    public void setVoided(boolean voided) {
        isVoided = voided;
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
        if (!(isOrgAdmin || isAdmin())) roles.add(USER);
        if (isAdmin()) roles.add(ADMIN);
        if (isOrgAdmin) roles.add(ORGANISATION_ADMIN);
        return roles.toArray(new String[0]);
    }

    public void setOrgAdmin(boolean orgAdmin) {
        isOrgAdmin = orgAdmin;
    }

    public Set<AccountAdmin> getAccountAdmin() {
        return accountAdmin;
    }

    public void setAccountAdmin(AccountAdmin accountAdmin) {
        this.accountAdmin.clear();
        if (accountAdmin != null) {
            this.accountAdmin.add(accountAdmin);
        }
    }

    public boolean isAdmin() {
        return accountAdmin.size() > 0;
    }

    public boolean isOrgAdmin() {
        return isOrgAdmin;
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

    public JsonObject getSettings() {
        return settings;
    }

    public void setSettings(JsonObject settings) {
        this.settings = settings;
    }

    public void setAuditInfo(User currentUser) {
        if (this.getCreatedBy() == null) {
            this.setCreatedBy(currentUser);
            this.setCreatedDateTime(new DateTime());
        }
        this.setLastModifiedBy(currentUser);
        this.setLastModifiedDateTime(new DateTime());
    }

    public void assignUUID() {
        this.uuid = UUID.randomUUID().toString();
    }

    public void assignUUIDIfRequired() {
        if (this.uuid == null) this.assignUUID();
    }

    public static void validateEmail(String email) {
        if (!EmailValidator.getInstance().isValid(email)) {
            throw new ValidationException(String.format("Invalid email address %s", email));
        }
    }

    public static void validatePhoneNumber(String phoneNumber) {
        if (!phoneNumber.matches(MOBILE_NUMBER_PATTERN)) {
            throw new ValidationException(String.format("Invalid phone number %s", phoneNumber));
        }
    }

    /**
     * username must be at least 7 char and
     * must be in the format of xxx@yyy
     * where yyy is {@link Organisation#getUsernameSuffix()} and xxx represents user
     */
    public static void validateUsername(String username) {
        if (username == null || !username.contains("@") || username.length() < 7) {
            throw new ValidationException(String.format("Invalid username '%s'. It must be at least 7 characters.", username));
        }
    }
}
