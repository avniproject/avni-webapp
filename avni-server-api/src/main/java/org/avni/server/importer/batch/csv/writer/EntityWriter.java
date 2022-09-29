package org.avni.server.importer.batch.csv.writer;

import org.avni.server.application.OrganisationConfigSettingKeys;
import org.avni.server.framework.security.UserContextHolder;
import org.avni.server.service.OrganisationConfigService;

public abstract class EntityWriter {
    private final OrganisationConfigService organisationConfigService;

    protected EntityWriter(OrganisationConfigService organisationConfigService) {
        this.organisationConfigService = organisationConfigService;
    }

    protected boolean skipRuleExecution() {
        return (Boolean) organisationConfigService.getOrganisationSettingsValue(UserContextHolder.getOrganisation(), OrganisationConfigSettingKeys.skipRuleExecution).orElse(false);
    }
}
