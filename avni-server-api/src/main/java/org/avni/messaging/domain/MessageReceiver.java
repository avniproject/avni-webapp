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
    private ReceiverEntityType entityType;

    @Column
    @NotNull
    private Long entityId;

    @Column
    private String externalId;

    public MessageReceiver(ReceiverEntityType entityType, Long entityId, String externalId) {
        this.entityType = entityType;
        this.entityId = entityId;
        this.externalId = externalId;
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

    public String getExternalId() {
        return externalId;
    }
}
