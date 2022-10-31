package org.avni.messaging.domain;

import org.avni.server.domain.OrganisationAwareEntity;
import org.joda.time.DateTime;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

@Entity
@Table(name = "message_request_queue")
public class MessageRequest extends OrganisationAwareEntity {
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "message_rule_id")
    private MessageRule messageRule;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "message_receiver_id")
    private MessageReceiver messageReceiver;

    @NotNull
    @Column
    private Long entityId;

    @Column
    @NotNull
    private DateTime scheduledDateTime;

    @Column
    @NotNull
    @Enumerated(EnumType.STRING)
    private MessageDeliveryStatus deliveryStatus;

    @Column
    private DateTime deliveredDateTime;

    public void setMessageRule(MessageRule messageRule) {
        this.messageRule = messageRule;
    }

    public void setMessageReceiver(MessageReceiver messageReceiver) {
        this.messageReceiver = messageReceiver;
    }

    public void setEntityId(Long entityId) {
        this.entityId = entityId;
    }

    public void setScheduledDateTime(DateTime scheduledDateTime) {
        this.scheduledDateTime = scheduledDateTime;
    }

    public void setDeliveryStatus(MessageDeliveryStatus deliveryStatus) {
        this.deliveryStatus = deliveryStatus;
    }

    public void setDeliveredDateTime(DateTime deliveredDateTime) {
        this.deliveredDateTime = deliveredDateTime;
    }

    public MessageRequest() {
    }

    public MessageRequest(MessageRule messageRule, MessageReceiver messageReceiverId, Long entityId, DateTime scheduledDateTime) {
        this.messageRule = messageRule;
        this.messageReceiver = messageReceiverId;
        this.entityId = entityId;
        this.scheduledDateTime = scheduledDateTime;
        this.deliveryStatus = MessageDeliveryStatus.NotSent;
    }
    public void markComplete() {
        deliveryStatus = MessageDeliveryStatus.Sent;
        deliveredDateTime = DateTime.now();
    }

    public MessageRule getMessageRule() {
        return messageRule;
    }

    public MessageReceiver getMessageReceiver() {
        return messageReceiver;
    }

    public Long getEntityId() {
        return entityId;
    }

    public DateTime getScheduledDateTime() {
        return scheduledDateTime;
    }

    public MessageDeliveryStatus getDeliveryStatus() {
        return deliveryStatus;
    }

    public DateTime getDeliveredDateTime() {
        return deliveredDateTime;
    }
}
