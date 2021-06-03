package org.openchs.dao.search;

import org.junit.Test;
import org.openchs.web.request.webapp.search.Concept;
import org.openchs.web.request.webapp.search.DateRange;
import org.openchs.web.request.webapp.search.IntegerRange;

import java.util.ArrayList;
import java.util.Arrays;

import static org.assertj.core.api.Assertions.assertThat;

public class SubjectSearchQueryBuilderTest {

    @Test
    public void shouldBuildBaseQueryWhenRunWithoutParameters() {
        SubjectSearchQuery query = new SubjectSearchQueryBuilder().build();
        System.out.println(query.getSql());
        assertThat(query.getSql()).isNotEmpty();
    }

    @Test
    public void shouldBeAbleToSearchByName() {
        SubjectSearchQuery query = new SubjectSearchQueryBuilder()
                .withNameFilter("name")
                .build();
        assertThat(query.getSql()).isNotEmpty();
    }

    @Test
    public void shouldNotAddNameFiltersForNullOrEmptyNames() {
        SubjectSearchQuery query = new SubjectSearchQueryBuilder()
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
        SubjectSearchQuery query = new SubjectSearchQueryBuilder()
                .withNameFilter("two tokens  andAnother")
                .build();
        assertThat(query.getParameters().values().contains("%two%")).isTrue();
        assertThat(query.getParameters().values().contains("%tokens%")).isTrue();
        assertThat(query.getParameters().values().contains("%andAnother%")).isTrue();
        assertThat(query.getParameters().size()).isEqualTo(5);
    }

    @Test
    public void shouldAddAgeFilter() {
        SubjectSearchQuery query = new SubjectSearchQueryBuilder()
                .withAgeFilter(new IntegerRange(1, null))
                .build();
        assertThat(query.getParameters().size()).isEqualTo(3);
    }

    @Test
    public void shouldAddGenderFilter() {
        SubjectSearchQuery query = new SubjectSearchQueryBuilder()
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
        SubjectSearchQuery query = new SubjectSearchQueryBuilder()
                .withEncounterDateFilter(new DateRange("2021-01-01", "2022-01-01"))
                .build();
        assertThat(query.getParameters().size()).isEqualTo(4);
    }

    @Test
    public void shouldNotAddTheSameJoinsMultipleTimes() {
        SubjectSearchQuery query = new SubjectSearchQueryBuilder()
                .withProgramEncounterDateFilter(new DateRange("2021-01-01", "2022-01-01"))
                .withProgramEnrolmentDateFilter(new DateRange("2021-01-01", "2022-01-01"))
                .build();
        assertThat(query.getParameters().size()).isEqualTo(6);
    }

    @Test
    public void shouldAddConditionsForConcepts() {
        SubjectSearchQuery query = new SubjectSearchQueryBuilder()
                .withConceptsFilter(Arrays.asList(
                        new Concept[]{new Concept("uuid", "registration", "CODED", Arrays.asList(new String[]{"asdf", "qwer"}), null)}))
                .build();
    }

    @Test
    public void shouldMakeQueryForCount() {
        SubjectSearchQuery query = new SubjectSearchQueryBuilder().forCount()
                .build();
    }

}
