package org.avni.messaging.contract;

import org.avni.messaging.domain.EntityType;
import org.avni.messaging.domain.MessageRule;
import org.junit.Test;

import static org.junit.Assert.*;

public class MessageRuleContractTest {

    @Test
    public void shouldConvertContractToNewModel() {
        MessageRuleContract messageRuleContract = new MessageRuleContract();
        String name = "Rule 1.2.3";
        messageRuleContract.setName(name);
        messageRuleContract.setMessageRule("messageRule");
        messageRuleContract.setScheduleRule("scheduleRule");
        messageRuleContract.setEntityType("ProgramEncounter");
        messageRuleContract.setEntityTypeId("1");
        messageRuleContract.setMessageTemplateId("2");
        MessageRule messageRule = messageRuleContract.toModel(null);

        assertEquals(messageRule.getEntityType(), EntityType.ProgramEncounter);
        assertEquals(messageRule.getName(), name);
        assertNotNull(messageRule.getUuid());
        assertNull(messageRule.getId());
    }

    @Test
    public void shouldNotFailForMissingFields() {
        new MessageRuleContract().toModel(null);
    }

    @Test
    public void shouldSetVoidedToFalseByDefault() {
        MessageRule messageRule = new MessageRuleContract().toModel(null);

        assertFalse(messageRule.isVoided());
    }

    @Test
    public void shouldUseExistingModelIfProvided() {
        MessageRule messageRule = new MessageRule();
        MessageRule result = new MessageRuleContract().toModel(messageRule);

        assertEquals(result, messageRule);
    }
}