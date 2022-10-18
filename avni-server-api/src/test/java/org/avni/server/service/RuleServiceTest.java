package org.avni.server.service;

import org.avni.server.domain.Individual;
import org.avni.server.web.RestClient;
import org.avni.server.web.request.rules.RulesContractWrapper.IndividualContract;
import org.avni.server.web.request.rules.constructWrappers.IndividualConstructionService;
import org.avni.server.web.request.rules.request.ScheduleRuleRequestEntity;
import org.joda.time.DateTime;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;
import org.junit.Before;
import org.junit.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;

import static org.assertj.core.api.Assertions.assertThat;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.mockito.MockitoAnnotations.initMocks;

public class RuleServiceTest {

    @Mock
    private IndividualConstructionService individualConstructionService;

    @Mock
    private IndividualService individualService;

    private RestClient restClient;

    private RuleService ruleService;

    @Captor
    ArgumentCaptor<ScheduleRuleRequestEntity> scheduleRuleRequestEntity;


    @Before
    public void setUp() throws Exception {
        initMocks(this);
        restClient = mock(RestClient.class);
        ruleService = new RuleService(restClient, individualConstructionService, individualService);
    }

    @Test
    public void shouldExecuteScheduleRule() {
        Long individualId = 123L;
        Individual individual = mock(Individual.class);
        IndividualContract individualContract = mock(IndividualContract.class);
        String scheduleRule = "function(params, imports) { return {'scheduledDateTime': '2013-02-04 10:35:24'; }}";
        String scheduledDateTimeResponse = "{\"scheduledDateTime\": \"2013-02-04 10:35:24\", \"status\": \"success\"}";

        when(individualService.findById(individualId)).thenReturn(individual);
        when(individualConstructionService.getSubjectInfo(individual)).thenReturn(individualContract);
        when(restClient.post(anyString(), any())).thenReturn(scheduledDateTimeResponse);

        DateTime dateTime = ruleService.executeScheduleRule(individualId, scheduleRule);

        verify(restClient).post(eq("api/scheduleRule"), scheduleRuleRequestEntity.capture());
        ScheduleRuleRequestEntity scheduleRuleRequestEntity = this.scheduleRuleRequestEntity.getValue();
        assertThat(scheduleRuleRequestEntity.getEntity()).isEqualTo(individualContract);
        assertThat(scheduleRuleRequestEntity.getScheduleRule()).isEqualTo(scheduleRule);

        DateTimeFormatter formatter = DateTimeFormat.forPattern("yyyy-MM-dd HH:mm:ss");
        String scheduledDateTimeString = "2013-02-04 10:35:24";
        DateTime scheduledDateTime = formatter.parseDateTime(scheduledDateTimeString);
        assertThat(dateTime).isEqualTo(scheduledDateTime);
    }
}
