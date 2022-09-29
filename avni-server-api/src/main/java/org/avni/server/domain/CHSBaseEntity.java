package org.avni.server.domain;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.UUID;

@MappedSuperclass
public class CHSBaseEntity {
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false, nullable = false)
    @Id
    private Long id;

    @Column
    @NotNull
    private String uuid;

    @Column
    private boolean isVoided;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public boolean isVoided() {
        return isVoided;
    }

    public void setVoided(boolean voided) {
        isVoided = voided;
    }

    public void setVoided(Boolean voided) {
        isVoided = voided;
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

    public void assignUUIDIfRequired() {
        if (this.uuid == null) this.assignUUID();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        CHSBaseEntity that = (CHSBaseEntity) o;

        if (id != null ? !id.equals(that.id) : that.id != null) return false;
        return uuid != null ? uuid.equals(that.uuid) : that.uuid == null;
    }

    @Override
    public int hashCode() {
        int result = id != null ? id.hashCode() : 0;
        result = 31 * result + (uuid != null ? uuid.hashCode() : 0);
        return result;
    }
}
