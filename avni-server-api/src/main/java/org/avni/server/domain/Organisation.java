package org.avni.server.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.hibernate.annotations.BatchSize;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.UUID;

@Entity
@Table(name = "organisation")
@BatchSize(size = 100)
public class Organisation extends ETLEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false, nullable = false)
    private Long id;

    @Column
    private String mediaDirectory;

    @Column
    private Long parentOrganisationId;

    @Column
    @NotNull
    private String uuid;

    @Column
    private String usernameSuffix;

    @Column
    private boolean isVoided;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    public Organisation() {
    }

    public Organisation(String name) {
        this.setName(name);
    }

    public Account getAccount() {
        return account;
    }

    public void setAccount(Account account) {
        this.account = account;
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

    public void assignUUID() {
        this.uuid = UUID.randomUUID().toString();
    }

    public String getMediaDirectory() {
        return mediaDirectory;
    }

    public void setMediaDirectory(String mediaDirectory) {
        this.mediaDirectory = mediaDirectory;
    }

    public Long getParentOrganisationId() {
        return parentOrganisationId;
    }

    public void setParentOrganisationId(Long parentOrganisationId) {
        this.parentOrganisationId = parentOrganisationId;
    }

    public String getUsernameSuffix() {
        return usernameSuffix;
    }

    public void setUsernameSuffix(String usernameSuffix) {
        this.usernameSuffix = usernameSuffix;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        Organisation organisation = (Organisation) o;

        if (id != null ? !id.equals(organisation.id) : organisation.id != null) return false;
        return uuid != null ? uuid.equals(organisation.uuid) : organisation.uuid == null;
    }

    @Override
    public int hashCode() {
        int result = id != null ? id.hashCode() : 0;
        result = 31 * result + (uuid != null ? uuid.hashCode() : 0);
        return result;
    }

    @JsonIgnore
    public boolean isNew() {
        Long id = getId();
        return (id == null || id == 0);
    }

    public boolean isVoided() {
        return isVoided;
    }

    public void setVoided(boolean voided) {
        isVoided = voided;
    }

}
