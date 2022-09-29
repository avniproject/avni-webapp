package org.avni.dao.search;

import org.avni.server.dao.search.SqlQuery;
import org.avni.server.dao.search.SubjectSearchQueryBuilder;
import org.junit.Test;
import org.avni.server.web.request.webapp.search.Concept;
import org.avni.server.web.request.webapp.search.DateRange;
import org.avni.server.web.request.webapp.search.IntegerRange;

import java.util.ArrayList;
import java.util.Arrays;

import static org.assertj.core.api.Assertions.assertThat;

public class SubjectSearchQueryBuilderTest {

    @Test
    public void shouldBuildBaseQueryWhenRunWithoutParameters() {
        SqlQuery query = new SubjectSearchQueryBuilder().build();
        System.out.println(query.getSql());
        assertThat(query.getSql()).isNotEmpty();
    }

    @Test
    public void shouldBeAbleToSearchByName() {
        SqlQuery query = new SubjectSearchQueryBuilder()
                .withNameFilter("name")
                .build();
        assertThat(query.getSql()).isNotEmpty();
    }

    @Test
    public void shouldNotAddNameFiltersForNullOrEmptyNames() {
        SqlQuery query = new SubjectSearchQueryBuilder()
                .withNameFilter("    ")
                .build();
        assertThat(query.getSql().contains("i.last_name ilike")).isFalse();

        query = new SubjectSearchQueryBuilder()
                .withNameFilter(null)
                .build();
        assertThat(query.getSql().contains("i.last_name ilike")).isFalse();
    }

    @Test
    public void shouldBreakNameStringIntoTokensInTheQuery() {
        SqlQuery query = new SubjectSearchQueryBuilder()
                .withNameFilter("two tokens  andAnother")
                .build();
        assertThat(query.getParameters().values().contains("%two%")).isTrue();
        assertThat(query.getParameters().values().contains("%tokens%")).isTrue();
        assertThat(query.getParameters().values().contains("%andAnother%")).isTrue();
        assertThat(query.getParameters().size()).isEqualTo(5);
    }

    @Test
    public void shouldAddAgeFilter() {
        SqlQuery query = new SubjectSearchQueryBuilder()
                .withAgeFilter(new IntegerRange(1, null))
                .build();
        assertThat(query.getParameters().size()).isEqualTo(3);
    }

    @Test
    public void shouldAddGenderFilter() {
        SqlQuery query = new SubjectSearchQueryBuilder()
                .withGenderFilter(null)
                .build();
        assertThat(query.getParameters().size()).isEqualTo(2);

        ArrayList<String> genders = new ArrayList<>();
        genders.add("firstGenderUuid");
        query = new SubjectSearchQueryBuilder()
                .withGenderFilter(genders)
                .build();
        assertThat(query.getParameters().size()).isEqualTo(3);
    }

    @Test
    public void shouldAddEncounterJoinWhtnAddingEncounterDateFilter() {
        SqlQuery query = new SubjectSearchQueryBuilder()
                .withEncounterDateFilter(new DateRange("2021-01-01", "2022-01-01"))
                .build();
        assertThat(query.getParameters().size()).isEqualTo(4);
    }

    @Test
    public void shouldNotAddTheSameJoinsMultipleTimes() {
        SqlQuery query = new SubjectSearchQueryBuilder()
                .withProgramEncounterDateFilter(new DateRange("2021-01-01", "2022-01-01"))
                .withProgramEnrolmentDateFilter(new DateRange("2021-01-01", "2022-01-01"))
                .build();
        assertThat(query.getParameters().size()).isEqualTo(6);
    }

    @Test
    public void shouldAddConditionsForConcepts() {
        SqlQuery query = new SubjectSearchQueryBuilder()
                .withConceptsFilter(Arrays.asList(
                        new Concept[]{new Concept("uuid", "registration", "CODED", Arrays.asList(new String[]{"asdf", "qwer"}), null)}))
                .build();
    }

    @Test
    public void shouldMakeQueryForCount() {
        SqlQuery query = new SubjectSearchQueryBuilder().forCount()
                .build();
    }

}
