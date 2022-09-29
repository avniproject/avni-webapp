package org.avni.dao.search;

import org.avni.server.dao.search.EncounterSearchQueryBuilder;
import org.avni.server.dao.search.SqlQuery;
import org.avni.server.domain.Organisation;
import org.avni.server.domain.UserContext;
import org.avni.server.framework.security.UserContextHolder;
import org.avni.server.web.api.EncounterSearchRequest;
import org.junit.Before;
import org.junit.Test;
import org.springframework.data.domain.PageRequest;

import java.util.Date;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.*;

public class EncounterSearchQueryBuilderTest {

    @Before
    public void setup() {
        UserContext context = new UserContext();
        Organisation organisation = new Organisation();
        organisation.setId(1l);
        context.setOrganisation(organisation);
        UserContextHolder.create(context);
    }

    @Test
    public void shouldCreateABaseQuery() {
        EncounterSearchQueryBuilder encounterSearchQueryBuilder = new EncounterSearchQueryBuilder();
        System.out.println(encounterSearchQueryBuilder.build());
    }

    @Test
    public void shouldAddDefaultParameters() {
        SqlQuery query = new EncounterSearchQueryBuilder().build();
        assertThat(query.getParameters().containsKey("offset"), is(true));
        assertThat(query.getParameters().get("offset"), is(0));
        assertThat(query.getParameters().get("limit"), is(10));
    }


    @Test
    public void shouldAddPaginationParameters() {
        SqlQuery query = new EncounterSearchQueryBuilder().withPaginationFilters(PageRequest.of(2, 10)).build();
        System.out.println(query.getSql());
        assertThat(query.getParameters().containsKey("offset"), is(true));
        assertThat(query.getParameters().get("offset"), is(20));
        assertThat(query.getParameters().get("limit"), is(10));
    }

    @Test
    public void shouldWorkWithEmptySearchParameters() {
        SqlQuery sqlQuery = new EncounterSearchQueryBuilder().withRequest(new EncounterSearchRequest(null, null, null, null, null, PageRequest.of(0, 10))).build();
        System.out.println(sqlQuery.getSql());
    }

    @Test
    public void shouldMakeTheRightQuery() {
        SqlQuery sqlQuery = new EncounterSearchQueryBuilder().withRequest(new EncounterSearchRequest(null, null, null, null, null, PageRequest.of(0, 10))).build();
        System.out.println(sqlQuery.getSql());

        sqlQuery = new EncounterSearchQueryBuilder().withRequest(new EncounterSearchRequest(new Date(), new Date(), "Daily visit", "011-293af-23-12", null, PageRequest.of(1, 10))).build();
        System.out.println(sqlQuery.getSql());

        System.out.println(String.format("e.observations @> '{\"%s\": \"%s\"}'::jsonb", "key", "value"));
    }
}
