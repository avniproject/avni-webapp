package org.avni.importer.batch.csv.writer;

import org.avni.application.OrganisationConfigSettingKeys;
import org.avni.framework.security.UserContextHolder;
import org.avni.service.OrganisationConfigService;

public abstract class EntityWriter {
    private final OrganisationConfigService organisationConfigService;

    protected EntityWriter(OrganisationConfigService organisationConfigService) {
        this.organisationConfigService = organisationConfigService;
    }

    protected boolean skipRuleExecution() {
        return (Boolean) organisationConfigService.getOrganisationSettingsValue(UserContextHolder.getOrganisation(), OrganisationConfigSettingKeys.skipRuleExecution);
    }
}
