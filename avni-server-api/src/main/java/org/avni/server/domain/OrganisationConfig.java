package org.avni.server.domain;


import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.Type;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;

@Entity
@Table(name = "organisation_config")
@BatchSize(size = 100)
public class OrganisationConfig extends OrganisationAwareEntity {

    @Column
    @Type(type = "jsonObject")
    private JsonObject settings;

    @Column(name = "worklist_updation_rule")
    private String worklistUpdationRule;

    public JsonObject getSettings() {
        return settings;
    }

    public void setSettings(JsonObject settings) {
        this.settings = settings;
    }
    public String getWorklistUpdationRule(){
        return worklistUpdationRule;
    }

    public void setWorklistUpdationRule(String worklistUpdationRule){
        this.worklistUpdationRule = worklistUpdationRule;
    }

}
