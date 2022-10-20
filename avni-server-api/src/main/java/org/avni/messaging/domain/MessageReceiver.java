package org.avni.messaging.domain;

import org.avni.server.domain.OrganisationAwareEntity;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

@Entity
@Table(name = "message_receiver")
public class MessageReceiver extends OrganisationAwareEntity {
    @Column
    @NotNull
    @Enumerated(EnumType.STRING)
    private final ReceiverEntityType entityType;

    @Column
    @NotNull
    private final Long entityId;

    public MessageReceiver(ReceiverEntityType entityType, Long entityId) {
        this.entityType = entityType;
        this.entityId = entityId;
    }

    public MessageReceiver() {
        entityType = null;
        entityId = null;
    }

    public Long getEntityId() {
        return entityId;
    }

    public ReceiverEntityType getEntityType() {
        return entityType;
    }
}
