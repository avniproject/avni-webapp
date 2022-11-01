package org.avni.server.domain;


import com.fasterxml.jackson.annotation.JsonIgnore;
import org.avni.server.application.OrganisationConfigSettingKey;
import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.Type;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;
import java.util.Optional;

@Entity
@Table(name = "organisation_config")
@BatchSize(size = 100)
public class OrganisationConfig extends OrganisationAwareEntity {

    //  Check keys in OrganisationConfigSettingKeys
    @Column
    @Type(type = "jsonObject")
    private JsonObject settings;

    @Column(name = "worklist_updation_rule")
    private String worklistUpdationRule;

    @Column(name = "export_settings")
    @Type(type = "jsonObject")
    private JsonObject exportSettings;

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

    public Object getConfigValue(OrganisationConfigSettingKey organisationConfigSettingKey) {
        return settings.get(String.valueOf(organisationConfigSettingKey));
    }

    public Optional<Object> getConfigValueOptional(OrganisationConfigSettingKey organisationConfigSettingKey) {
        return Optional.ofNullable(this.getConfigValue(organisationConfigSettingKey));
    }

    @JsonIgnore
    public JsonObject getExportSettings() {
        return exportSettings;
    }

    public void setExportSettings(JsonObject exportSettings) {
        this.exportSettings = exportSettings;
    }
    public Boolean isFeatureEnabled(String feature) {
        return (Boolean) getSettings().getOrDefault(feature, false);
    }
}
