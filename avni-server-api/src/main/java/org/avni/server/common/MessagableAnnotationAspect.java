package org.avni.server.common;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.avni.messaging.domain.EntityType;
import org.avni.messaging.service.MessagingService;
import org.avni.server.domain.Individual;
import org.avni.server.domain.SyncAttributeEntity;
import org.avni.server.service.OrganisationConfigService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
@Aspect
public class MessagableAnnotationAspect {

    @Autowired
    private MessagingService messagingService;

    @Autowired
    private OrganisationConfigService organisationConfigService;
    private static Logger logger = LoggerFactory.getLogger(MessagableAnnotationAspect.class);

    @AfterReturning(value = "@annotation(Messagable)", returning = "entity")
    public void sendMessage(JoinPoint joinPoint, SyncAttributeEntity entity) {
        logger.info("MessagableAnnotationAspect invoked.");

        if (!organisationConfigService.isMessagingEnabled())
            return;

        Long individualId = entity.getIndividual() != null ? ((Individual) entity.getIndividual()).getId() : entity.getId();
        EntityType entityType = ((MethodSignature) joinPoint.getSignature()).getMethod().getAnnotation(Messagable.class).value();
        messagingService.onEntityCreateOrUpdate(entity.getId(), entity.getEntityType().getId(), entityType, individualId);
    }
}
