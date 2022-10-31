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

    @Column
    @NotNull
    private DateTime scheduledDateTime;

    @Column
    @NotNull
    @Enumerated(EnumType.STRING)
    private MessageDeliveryStatus deliveryStatus;

    @Column
    private DateTime deliveredDateTime;

    public MessageRequest(MessageRule messageRule, MessageReceiver messageReceiverId, DateTime scheduledDateTime) {
        this.messageRule = messageRule;
        this.messageReceiver = messageReceiverId;
        this.scheduledDateTime = scheduledDateTime;
        this.deliveryStatus = MessageDeliveryStatus.NotSent;
    }

    public MessageRequest() {
        this.messageReceiver = null;
        this.scheduledDateTime = null;
        this.deliveryStatus = null;
        messageRule = null;
    }

    public MessageRule getMessageRule() {
        return messageRule;
    }

    public DateTime getScheduledDateTime() {
        return scheduledDateTime;
    }

    public MessageReceiver getMessageReceiver() {
        return messageReceiver;
    }

    public MessageDeliveryStatus getDeliveryStatus() {
        return deliveryStatus;
    }

    public DateTime getDeliveredDateTime() {
        return deliveredDateTime;
    }

    public void markComplete() {
        deliveryStatus = MessageDeliveryStatus.Sent;
        deliveredDateTime = DateTime.now();
    }
}
