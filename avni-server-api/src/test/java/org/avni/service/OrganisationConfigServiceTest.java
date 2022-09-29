package org.avni.service;

import org.avni.server.application.OrganisationConfigSettingKeys;
import org.avni.server.dao.OrganisationConfigRepository;
import org.avni.server.domain.JsonObject;
import org.avni.server.domain.Organisation;
import org.avni.server.domain.OrganisationConfig;
import org.avni.server.service.OrganisationConfigService;
import org.junit.Test;

import java.util.Optional;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import static org.hamcrest.Matchers.*;

public class OrganisationConfigServiceTest {

    @Test
    public void shouldRetrieveOptionalObjectFromOrganisationSettings() {
        OrganisationConfigRepository organisationRepository = mock(OrganisationConfigRepository.class);
        OrganisationConfig organisationConfig = new OrganisationConfig();
        JsonObject settings = new JsonObject().with(OrganisationConfigSettingKeys.enableApprovalWorkflow.name(), true);
        organisationConfig.setSettings(settings);
        when(organisationRepository.findByOrganisationId(25l)).thenReturn(organisationConfig);
        OrganisationConfigService organisationConfigService = new OrganisationConfigService(organisationRepository, null, null, null, null);

        Organisation organisation = new Organisation();
        organisation.setId(25l);
        Optional<Object> enableComments = organisationConfigService.getOrganisationSettingsValue(organisation, OrganisationConfigSettingKeys.enableComments);
        Optional<Object> enableApprovalWorkflow = organisationConfigService.getOrganisationSettingsValue(organisation, OrganisationConfigSettingKeys.enableApprovalWorkflow);

        assertThat(enableComments.isPresent(), is(false));
        assertThat(enableApprovalWorkflow.isPresent(), is(true));
        assertThat(enableApprovalWorkflow.get(), is(true));
    }
}