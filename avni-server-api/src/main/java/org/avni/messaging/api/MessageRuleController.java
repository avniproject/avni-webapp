package org.avni.messaging.api;

import org.avni.messaging.contract.MessageRuleContract;
import org.avni.messaging.domain.EntityType;
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

    /**
     * Find all messageRules
     * Either use no parameters, or both entityType and entityTypeId together.
     * EntityType should be one of <code>EntityType</code>
     *
     * @param entityType
     * @param entityTypeId
     * @param pageable
     * @return
     */
    @RequestMapping(value = "/web/messageRule", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    public Page<MessageRuleContract> find(@RequestParam(required = false) String entityType, @RequestParam (required = false) String entityTypeId, Pageable pageable) {
        if (isAString(entityType) && isAString(entityTypeId)) {
            EntityType entityTypeValue = EntityType.valueOf(entityType);
            return messagingService.findByEntityTypeAndEntityTypeId(entityTypeValue, entityTypeId, pageable).map(MessageRuleContract::new);
        }

        return messagingService.findAll(pageable).map(MessageRuleContract::new);
    }

    @RequestMapping(value = "/web/messageRule/{id}", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    public ResponseEntity<MessageRuleContract> findOne(@PathVariable("id") Long id ) {
        MessageRule messageRule = messagingService.find(id);
        return messageRule == null? ResponseEntity.notFound().build() : ResponseEntity.ok(new MessageRuleContract(messageRule));
    }

    private boolean isAString(String s) {
        return s != null && !s.isEmpty();
    }
}
