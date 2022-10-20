package org.avni.messaging.service;

import org.avni.messaging.contract.glific.GlificMessageTemplate;
import org.avni.messaging.repository.MessageTemplateRepository;
import org.avni.server.service.OrganisationConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
public class MessageTemplateService {

    private MessageTemplateRepository messageTemplateRepository;
    private OrganisationConfigService organisationConfigService;

    @Autowired
    public MessageTemplateService(MessageTemplateRepository messageTemplateRepository, OrganisationConfigService organisationConfigService) {
        this.messageTemplateRepository = messageTemplateRepository;
        this.organisationConfigService = organisationConfigService;
    }

    public List<GlificMessageTemplate> findAll() {
        return organisationConfigService.isMessagingEnabled()?
                messageTemplateRepository.findAll():
                Collections.emptyList();
    }
}
