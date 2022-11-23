package org.avni.messaging.contract;

import org.avni.messaging.domain.EntityType;
import org.avni.messaging.domain.MessageRule;
import org.avni.server.domain.CHSEntity;
import org.avni.server.service.EntityTypeRetrieverService;
import org.joda.time.DateTime;
import org.springframework.beans.BeanUtils;
import org.springframework.util.StringUtils;

import java.util.Optional;

public class MessageRuleContract {
    private Long id;
    private String uuid;

    private String name;
    private String messageRule;
    private String scheduleRule;
    private String entityType;
    private Long entityTypeId;
    private String entityTypeUuid;
    private String messageTemplateId;

    private Boolean isVoided;
    private UserContract createdBy;
    private DateTime createdDateTime;
    private UserContract lastModifiedBy;
    private DateTime lastModifiedDateTime;

    public MessageRuleContract() {
    }

    public MessageRuleContract(MessageRule messageRule, EntityTypeRetrieverService entityTypeRetrieverService) {
        if(entityTypeRetrieverService != null ) {
            CHSEntity entity = entityTypeRetrieverService.getEntityType(messageRule.getEntityType().toString(), messageRule.getEntityTypeId());
            setEntityTypeUuid(entity.getUuid());
        }

        BeanUtils.copyProperties(messageRule, this);
        setEntityType(messageRule.getEntityType().toString());
        setCreatedBy(new UserContract(messageRule.getCreatedBy()));
        setLastModifiedBy(new UserContract(messageRule.getLastModifiedBy()));
    }

    public MessageRule toModel(MessageRule messageRule) {
        MessageRule result = messageRule;
        if (result == null) {
            result = new MessageRule();
            result.assignUUID();
        } else {
            result.setId(getId());
            result.setUuid(getUuid());
        }
        result.setName(getName());
        result.setMessageRule(getMessageRule());
        result.setScheduleRule(getScheduleRule());
        if (getEntityType() != null) {
            result.setEntityType(EntityType.valueOf(StringUtils.capitalize(getEntityType())));
        }
        result.setEntityTypeId(getEntityTypeId());
        result.setMessageTemplateId(getMessageTemplateId());
        result.setVoided(Optional.ofNullable(getVoided()).orElse(false));

        return result;
    }

    public static MessageRule toModel(MessageRuleContract messageRuleContract, MessageRule messageRule, EntityTypeRetrieverService entityTypeRetrieverService) {
        if(messageRule == null) {
            messageRule = new MessageRule();
        }

        messageRule.setName(messageRuleContract.getName());
        messageRule.setUuid(messageRuleContract.getUuid());
        CHSEntity entityType = entityTypeRetrieverService.getEntityType(messageRuleContract.getEntityType(), messageRuleContract.getEntityTypeUuid());
        messageRule.setEntityTypeId(entityType.getId());
        messageRule.setEntityType(EntityType.valueOf(messageRuleContract.getEntityType()));
        messageRule.setScheduleRule(messageRuleContract.getScheduleRule());
        messageRule.setMessageRule(messageRuleContract.getMessageRule());
        messageRule.setMessageTemplateId(messageRuleContract.getMessageTemplateId());
        messageRule.setVoided(messageRuleContract.getVoided());
        return messageRule;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUuid() {
        return uuid;
    }

    public void setUuid(String uuid) {
        this.uuid = uuid;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getMessageRule() {
        return messageRule;
    }

    public void setMessageRule(String messageRule) {
        this.messageRule = messageRule;
    }

    public String getScheduleRule() {
        return scheduleRule;
    }

    public void setScheduleRule(String scheduleRule) {
        this.scheduleRule = scheduleRule;
    }

    public String getEntityType() {
        return entityType;
    }

    public void setEntityType(String entityType) {
        this.entityType = entityType;
    }

    public Long getEntityTypeId() {
        return entityTypeId;
    }

    public void setEntityTypeId(Long entityTypeId) {
        this.entityTypeId = entityTypeId;
    }

    public String getMessageTemplateId() {
        return messageTemplateId;
    }

    public void setMessageTemplateId(String messageTemplateId) {
        this.messageTemplateId = messageTemplateId;
    }

    public Boolean getVoided() {
        return isVoided;
    }

    public void setVoided(Boolean voided) {
        isVoided = voided;
    }

    public UserContract getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(UserContract createdBy) {
        this.createdBy = createdBy;
    }

    public DateTime getCreatedDateTime() {
        return createdDateTime;
    }

    public void setCreatedDateTime(DateTime createdDateTime) {
        this.createdDateTime = createdDateTime;
    }

    public UserContract getLastModifiedBy() {
        return lastModifiedBy;
    }

    public void setLastModifiedBy(UserContract lastModifiedBy) {
        this.lastModifiedBy = lastModifiedBy;
    }

    public DateTime getLastModifiedDateTime() {
        return lastModifiedDateTime;
    }

    public void setLastModifiedDateTime(DateTime lastModifiedDateTime) {
        this.lastModifiedDateTime = lastModifiedDateTime;
    }

    public String getEntityTypeUuid() {
        return entityTypeUuid;
    }

    public void setEntityTypeUuid(String entityTypeUuid) {
        this.entityTypeUuid = entityTypeUuid;
    }
}
