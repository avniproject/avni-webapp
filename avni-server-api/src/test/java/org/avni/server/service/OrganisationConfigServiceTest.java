package org.avni.server.service;

import org.avni.server.application.OrganisationConfigSettingKey;
import org.avni.server.dao.OrganisationConfigRepository;
import org.avni.server.domain.JsonObject;
import org.avni.server.domain.Organisation;
import org.avni.server.domain.OrganisationConfig;
import org.avni.server.domain.UserContext;
import org.avni.server.framework.security.UserContextHolder;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mockito;
import org.powermock.api.mockito.PowerMockito;
import org.powermock.core.classloader.annotations.PrepareForTest;
import org.powermock.modules.junit4.PowerMockRunner;

import java.util.Optional;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@RunWith(PowerMockRunner.class)
@PrepareForTest({UserContextHolder.class})
public class OrganisationConfigServiceTest {

    @Test
    public void shouldRetrieveOptionalObjectFromOrganisationSettings() {
        OrganisationConfigRepository organisationRepository = mock(OrganisationConfigRepository.class);
        OrganisationConfig organisationConfig = new OrganisationConfig();
        JsonObject settings = new JsonObject().with(OrganisationConfigSettingKey.enableApprovalWorkflow.name(), true);
        organisationConfig.setSettings(settings);
        when(organisationRepository.findByOrganisationId(25l)).thenReturn(organisationConfig);
        OrganisationConfigService organisationConfigService = new OrganisationConfigService(organisationRepository, null, null, null, null);

        Organisation organisation = new Organisation();
        organisation.setId(25l);
        Optional<Object> enableComments = organisationConfigService.getOrganisationSettingsValue(organisation, OrganisationConfigSettingKey.enableComments);
        Optional<Object> enableApprovalWorkflow = organisationConfigService.getOrganisationSettingsValue(organisation, OrganisationConfigSettingKey.enableApprovalWorkflow);

        assertThat(enableComments.isPresent(), is(false));
        assertThat(enableApprovalWorkflow.isPresent(), is(true));
        assertThat(enableApprovalWorkflow.get(), is(true));
    }

    @Test
    public void shouldCheckIfMessagingFeatureEnabled() {
        OrganisationConfigRepository organisationConfigRepository = mock(OrganisationConfigRepository.class);
        PowerMockito.mockStatic(UserContextHolder.class);
        UserContext userContext = mock(UserContext.class);
        long organisationId = 25l;
        when(userContext.getOrganisationId()).thenReturn(organisationId);
        Mockito.when(UserContextHolder.getUserContext()).thenReturn(userContext);

        OrganisationConfig organisationConfigWithoutMessagingEnabled = new OrganisationConfig();
        organisationConfigWithoutMessagingEnabled.setSettings(new JsonObject());
        OrganisationConfig organisationConfigWithMessagingEnabled = new OrganisationConfig();
        JsonObject settings = new JsonObject().with(OrganisationConfigSettingKey.enableMessaging.name(), true);
        organisationConfigWithMessagingEnabled.setSettings(settings);
        when(organisationConfigRepository.findByOrganisationId(organisationId)).thenReturn(organisationConfigWithoutMessagingEnabled).thenReturn(organisationConfigWithMessagingEnabled);
        OrganisationConfigService organisationConfigService = new OrganisationConfigService(organisationConfigRepository, null, null, null, null);

        assertThat(organisationConfigService.isMessagingEnabled(), is(false));
        assertThat(organisationConfigService.isMessagingEnabled(), is(true));
    }
}
