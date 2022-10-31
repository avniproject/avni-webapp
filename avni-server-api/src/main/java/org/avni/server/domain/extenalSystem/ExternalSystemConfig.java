package org.avni.server.domain.extenalSystem;

import org.avni.server.domain.JsonObject;
import org.avni.server.domain.OrganisationAwareEntity;
import org.hibernate.annotations.Type;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.validation.constraints.NotNull;

@Entity(name="external_system_config")
public class ExternalSystemConfig extends OrganisationAwareEntity {

    @NotNull
    @Column(name = "system_name")
    @Enumerated(value = EnumType.STRING)
    private SystemName systemName;

    @NotNull
    @Column
    @Type(type = "jsonObject")
    private JsonObject config;

    public SystemName getSystemName() {
        return systemName;
    }

    public void setSystemName(SystemName systemName) {
        this.systemName = systemName;
    }

    public JsonObject getConfig() {
        return config;
    }

    public void setConfig(JsonObject config) {
        this.config = config;
    }
}
