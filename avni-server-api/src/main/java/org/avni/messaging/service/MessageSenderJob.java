package org.avni.messaging.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class MessageSenderJob {
    private static final Logger logger = LoggerFactory.getLogger(MessagingService.class);
    private MessagingService messaggingService;

    @Autowired
    public MessageSenderJob(MessagingService messaggingService) {
        this.messaggingService = messaggingService;
    }

    @Scheduled(fixedDelayString = "${avni.messagingScheduleMillis}")
    public void sendMessages() {
        logger.info("Starting to send messages");
        messaggingService.sendMessages();
        logger.info("Completed sending messages");
    }
}
