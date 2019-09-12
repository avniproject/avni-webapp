package org.openchs.domain;


import org.hibernate.annotations.Type;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;

@Entity
@Table(name = "organisation_config")
public class OrganisationConfig extends OrganisationAwareEntity {

    @Column
    @Type(type = "jsonObject")
    private JsonObject settings;

    public JsonObject getSettings() {
        return settings;
    }

    public void setSettings(JsonObject settings) {
        this.settings = settings;
    }

}
