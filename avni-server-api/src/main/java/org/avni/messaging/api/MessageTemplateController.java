package org.avni.messaging.api;

import org.avni.messaging.contract.MessageTemplateContract;
import org.avni.messaging.repository.MessageTemplateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
public class MessageTemplateController {

    private final MessageTemplateRepository messageTemplateRepository;

    @Autowired
    public MessageTemplateController(MessageTemplateRepository messageTemplateRepository) {
        this.messageTemplateRepository = messageTemplateRepository;
    }

    @RequestMapping(value = "web/messageTemplates", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    public ResponseEntity<List<MessageTemplateContract>> findAll() {
        return ResponseEntity.ok(messageTemplateRepository.findAll().stream().map(MessageTemplateContract::new).collect(Collectors.toList()));
    }
}
