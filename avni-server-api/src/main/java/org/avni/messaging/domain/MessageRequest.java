package org.avni.messaging.domain;

import org.avni.server.domain.OrganisationAwareEntity;
import org.joda.time.DateTime;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;
import javax.validation.constraints.NotNull;

@Entity
@Table(name = "message_request")
public class MessageRequest extends OrganisationAwareEntity {
    @Column
    @NotNull
    private final Long messageRuleId;
    @Column
    @NotNull
    private final Long messageReceiverId;
    @Column
    @NotNull
    private final DateTime scheduledDateTime;
    @Column
    @NotNull
    private final MessageDeliveryStatus deliveryStatus;

    public MessageRequest(Long messageRuleId, Long messageReceiverId, DateTime scheduledDateTime) {
        this.messageRuleId = messageRuleId;
        this.messageReceiverId = messageReceiverId;
        this.scheduledDateTime = scheduledDateTime;
        this.deliveryStatus = MessageDeliveryStatus.NotSent;
    }

    public MessageRequest() {
        this.messageReceiverId = null;
        this.scheduledDateTime = null;
        this.deliveryStatus = null;
        messageRuleId = null;
    }

    public Long getMessageRuleId() {
        return messageRuleId;
    }

    public Long getMessageReceiverId() {
        return messageReceiverId;
    }

    public DateTime getScheduledDateTime() {
        return scheduledDateTime;
    }
}
