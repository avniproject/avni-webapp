package org.avni.server.dao;

import org.avni.server.common.AbstractControllerIntegrationTest;
import org.avni.server.domain.CustomQuery;
import org.avni.server.web.request.CustomQueryRequest;
import org.avni.server.web.response.CustomQueryResponse;
import org.joda.time.Instant;
import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;

import java.util.HashMap;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;


public class QueryRepositoryTest extends AbstractControllerIntegrationTest {

    @Autowired
    private NamedParameterJdbcTemplate externalQueryJdbcTemplate;

    private CustomQueryRepository customQueryRepository = mock(CustomQueryRepository.class);

    @Test
    public void shouldExpireInFiveSeconds() {
        CustomQuery customQuery = new CustomQuery();
        customQuery.setQuery("select 1, pg_sleep(5 * 60);"); //300 seconds
        when(customQueryRepository.findAllByName("query")).thenReturn(customQuery);

        CustomQueryRequest customQueryRequest = new CustomQueryRequest();
        customQueryRequest.setName("query");
        customQueryRequest.setQueryParams(new HashMap<>());

        QueryRepository queryRepository = new QueryRepository(externalQueryJdbcTemplate, customQueryRepository);

        Instant before = Instant.now();
        ResponseEntity<?> responseEntity = queryRepository.runQuery(customQueryRequest);
        Instant after = Instant.now();

        assertThat(after.getMillis() - before.getMillis(), lessThan(6000L)); //5 seconds is the configured limit. Add a leeway of 1 second
        assertThat(responseEntity.getStatusCode(), equalTo(HttpStatus.INTERNAL_SERVER_ERROR));
        assertThat(responseEntity.getBody().toString(), containsString("Query took more time to return the result"));
    }

    @Test
    public void shouldLimitRowsTo2000() {
        CustomQuery customQuery = new CustomQuery();
        customQuery.setQuery("SELECT generate_series(1, 2001);");
        when(customQueryRepository.findAllByName("query")).thenReturn(customQuery);

        CustomQueryRequest customQueryRequest = new CustomQueryRequest();
        customQueryRequest.setName("query");
        customQueryRequest.setQueryParams(new HashMap<>());

        QueryRepository queryRepository = new QueryRepository(externalQueryJdbcTemplate, customQueryRepository);

        ResponseEntity<CustomQueryResponse> responseEntity = (ResponseEntity<CustomQueryResponse>) queryRepository.runQuery(customQueryRequest);

        assertThat(responseEntity.getStatusCode(), equalTo(HttpStatus.OK));
        assertThat(responseEntity.getBody().getData().size(), equalTo(2000));
    }

    @Test
    public void shouldWorkAlongWithLimitRows() {
        CustomQuery customQuery = new CustomQuery();
        customQuery.setQuery("SELECT generate_series(1, 2001) limit 20;");
        when(customQueryRepository.findAllByName("query")).thenReturn(customQuery);

        CustomQueryRequest customQueryRequest = new CustomQueryRequest();
        customQueryRequest.setName("query");
        customQueryRequest.setQueryParams(new HashMap<>());

        QueryRepository queryRepository = new QueryRepository(externalQueryJdbcTemplate, customQueryRepository);

        ResponseEntity<CustomQueryResponse> responseEntity = (ResponseEntity<CustomQueryResponse>) queryRepository.runQuery(customQueryRequest);

        assertThat(responseEntity.getStatusCode(), equalTo(HttpStatus.OK));
        assertThat(responseEntity.getBody().getData().size(), equalTo(20));
    }
}