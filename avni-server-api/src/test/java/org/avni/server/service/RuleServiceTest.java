package org.avni.server.service;

import org.avni.server.domain.Individual;
import org.avni.server.web.RestClient;
import org.avni.server.web.request.rules.request.ScheduleRuleRequestEntity;
import org.avni.server.web.request.rules.response.ScheduleRuleResponseEntity;
import org.joda.time.DateTime;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;
import org.junit.Before;
import org.junit.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import static org.assertj.core.api.Assertions.assertThat;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.mockito.MockitoAnnotations.initMocks;

public class RuleServiceTest {

    private RestClient restClient;

    private RuleService ruleService;

    @Captor
    ArgumentCaptor<ScheduleRuleRequestEntity> scheduleRuleRequestEntity;

    @Before
    public void setUp() throws Exception {
        initMocks(this);
        restClient = mock(RestClient.class);
        ruleService = new RuleService(restClient);
    }

    @Test
    public void shouldExecuteScheduleRule() {
        Individual individual = mock(Individual.class);
        String scheduleRule = "function(params, imports) { return '2013-02-04 10:35:24'; }";

        String scheduledDateTimeResponse = "{\"scheduledDateTime\": \"2013-02-04 10:35:24\", \"status\": \"success\"}";
        when(restClient.post(anyString(), any())).thenReturn(scheduledDateTimeResponse);

        DateTime dateTime = ruleService.executeScheduleRule(individual, scheduleRule);

        verify(restClient).post(eq("api/scheduleRule"), scheduleRuleRequestEntity.capture());
        ScheduleRuleRequestEntity scheduleRuleRequestEntity = this.scheduleRuleRequestEntity.getValue();
        assertThat(scheduleRuleRequestEntity.getIndividual()).isEqualTo(individual);
        assertThat(scheduleRuleRequestEntity.getScheduleRule()).isEqualTo(scheduleRule);

        DateTimeFormatter formatter = DateTimeFormat.forPattern("yyyy-MM-dd HH:mm:ss");
        String scheduledDateTimeString = "2013-02-04 10:35:24";
        DateTime scheduledDateTime = formatter.parseDateTime(scheduledDateTimeString);
        assertThat(dateTime).isEqualTo(scheduledDateTime);
    }
}
