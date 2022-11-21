package org.avni.messaging.service;

import org.avni.messaging.domain.GlificSystemConfig;
import org.avni.server.application.OrganisationConfigSettingKey;
import org.avni.server.dao.externalSystem.ExternalSystemConfigRepository;
import org.avni.server.domain.OrganisationConfig;
import org.avni.server.domain.extenalSystem.SystemName;
import org.avni.server.framework.security.AuthService;
import org.avni.server.service.OrganisationConfigService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class MessageSenderJob {
    private static final Logger logger = LoggerFactory.getLogger(MessagingService.class);
    private MessagingService messagingService;

    private OrganisationConfigService organisationConfigService;

    private AuthService authService;

    private ExternalSystemConfigRepository externalSystemConfigRepository;

    @Autowired
    public MessageSenderJob(MessagingService messagingService, OrganisationConfigService organisationConfigService,
                            AuthService authService, ExternalSystemConfigRepository externalSystemConfigRepository) {
        this.messagingService = messagingService;
        this.organisationConfigService = organisationConfigService;
        this.authService = authService;
        this.externalSystemConfigRepository = externalSystemConfigRepository;
    }

    @Scheduled(fixedDelayString = "${avni.messagingScheduleMillis}")
    public void sendMessages() {
        logger.info("Job started");
        authService.authenticateByUserName("admin", null);
        List<OrganisationConfig> enabledOrganisations = organisationConfigService
                .findAllWithFeatureEnabled(OrganisationConfigSettingKey.enableMessaging.name());

        for (OrganisationConfig enabledOrganisation : enabledOrganisations) {
            sendMessages(enabledOrganisation);
            authService.authenticateByUserName("admin", null);
        }
        logger.info("Job ended");
    }

    private void sendMessages(OrganisationConfig enabledOrganisation) {
        GlificSystemConfig glificConfig =  externalSystemConfigRepository.getGlificSystemConfig(enabledOrganisation.getOrganisationId());
        authService.authenticateByUserName(glificConfig.getAvniSystemUser(), null);
        messagingService.sendMessages();
    }
}
