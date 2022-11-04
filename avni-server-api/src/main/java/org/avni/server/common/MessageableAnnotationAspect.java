package org.avni.server.common;

import com.bugsnag.Bugsnag;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.avni.messaging.domain.EntityType;
import org.avni.messaging.service.MessagingService;
import org.avni.server.domain.MessageableEntity;
import org.avni.server.service.OrganisationConfigService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Component
@Aspect
public class MessageableAnnotationAspect {

    private MessagingService messagingService;

    private OrganisationConfigService organisationConfigService;

    private Bugsnag bugsnag;
    private static Logger logger = LoggerFactory.getLogger(MessageableAnnotationAspect.class);

    @Autowired
    public MessageableAnnotationAspect(MessagingService messagingService, OrganisationConfigService organisationConfigService, Bugsnag bugsnag) {
        this.messagingService = messagingService;
        this.organisationConfigService = organisationConfigService;
        this.bugsnag = bugsnag;
    }

    @AfterReturning(value = "@annotation(org.avni.server.common.Messageable)", returning = "entity")
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void sendMessage(JoinPoint joinPoint, MessageableEntity entity) {
        logger.info("MessageableAnnotationAspect invoked.");

        if (!organisationConfigService.isMessagingEnabled())
            return;

        try {
            EntityType entityType = ((MethodSignature) joinPoint.getSignature()).getMethod().getAnnotation(Messageable.class).value();
            if (entity.isVoided()) {
                messagingService.onEntityDelete(entity.getEntityId(), entityType, entity.getIndividual().getId());
            } else {
                messagingService.onEntitySave(entity.getEntityId(), entity.getEntityTypeId(), entityType, entity.getIndividual().getId());
            }
        } catch (Exception e) {
            bugsnag.notify(e);
            logger.error("Could not save/delete message request for entity " + entity.getEntityId() + " with type id " + entity.getEntityTypeId(), e);
        }
    }
}
