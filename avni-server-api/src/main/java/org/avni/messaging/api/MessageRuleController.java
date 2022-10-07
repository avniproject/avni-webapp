package org.avni.messaging.api;

import org.avni.messaging.contract.MessageRuleContract;
import org.avni.messaging.domain.MessageRule;
import org.avni.messaging.service.MessagingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
public class MessageRuleController {

    private MessagingService messagingService;

    @Autowired
    public MessageRuleController(MessagingService messagingService) {
        this.messagingService = messagingService;
    }

    @RequestMapping(value = "/web/messageRule", method = RequestMethod.POST)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    public ResponseEntity<MessageRuleContract> save(@RequestBody MessageRuleContract messageRuleContract) {
        MessageRule existingEntity = messagingService.findByIdOrUuid(messageRuleContract.getId(), messageRuleContract.getUuid());
        MessageRule messageRule = messageRuleContract.toModel(existingEntity);

        messageRule = messagingService.saveRule(messageRule);
        return ResponseEntity.ok(new MessageRuleContract(messageRule));
    }

    @RequestMapping(value = "/web/messageRule", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    public Page<MessageRuleContract> findAll(Pageable pageable) {
        return messagingService.findAll(pageable).map(MessageRuleContract::new);
    }

    @RequestMapping(value = "/web/messageRule/{id}", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    public ResponseEntity<MessageRuleContract> findOne(@PathVariable("id") Long id ) {
        MessageRule messageRule = messagingService.find(id);
        return messageRule == null? ResponseEntity.notFound().build() : ResponseEntity.ok(new MessageRuleContract(messageRule));
    }
}
