package org.avni.messaging.domain;

import org.avni.server.domain.OrganisationAwareEntity;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;

@Entity
@Table(name = "message_receiver")
public class MessageReceiver extends OrganisationAwareEntity {
    @Column
    private final EntityType entityType;

    @Column
    private final Long entityId;

    public MessageReceiver(EntityType entityType, Long entityId) {
        this.entityType = entityType;
        this.entityId = entityId;
    }

    public MessageReceiver() {
        entityType = null;
        entityId = null;
    }

    public EntityType getEntityType() {
        return entityType;
    }

    public Long getEntityId() {
        return entityId;
    }
}
