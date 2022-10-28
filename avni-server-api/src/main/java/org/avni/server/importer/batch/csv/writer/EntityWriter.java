package org.avni.server.importer.batch.csv.writer;

import org.avni.server.application.OrganisationConfigSettingKey;
import org.avni.server.domain.OrganisationConfig;
import org.avni.server.framework.security.UserContextHolder;
import org.avni.server.service.OrganisationConfigService;

public abstract class EntityWriter {
    private final OrganisationConfigService organisationConfigService;

    protected EntityWriter(OrganisationConfigService organisationConfigService) {
        this.organisationConfigService = organisationConfigService;
    }

    protected boolean skipRuleExecution() {
        OrganisationConfig organisationConfig = organisationConfigService.getOrganisationConfig(UserContextHolder.getOrganisation());
        return (Boolean) organisationConfig.getConfigValueOptional(OrganisationConfigSettingKey.skipRuleExecution).orElse(false);
    }
}
