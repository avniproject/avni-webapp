package org.avni.server.dao.search;

import org.avni.server.web.request.webapp.search.DateRange;
import org.avni.server.web.request.webapp.search.SubjectSearchRequest;

public class SubjectSearchQueryBuilder extends BaseSubjectSearchQueryBuilder<SubjectSearchQueryBuilder> implements SearchBuilder {

    public SqlQuery build() {
        String baseQuery = "select distinct i.id as \"id\",\n" +
                "                i.first_name as \"firstName\",\n" +
                "                i.last_name as \"lastName\",\n" +
                "                i.profile_picture as \"profilePicture\",\n" +
                "                cast(concat_ws(' ',i.first_name,i.middle_name,i.last_name)as text) as \"fullName\",\n" +
                "                i.uuid as \"uuid\",\n" +
                "                cast(tllv.title_lineage as text) as \"addressLevel\",\n" +
                "                st.name as \"subjectTypeName\",\n" +
                "                gender.name as \"gender\",\n" +
                "                i.date_of_birth as \"dateOfBirth\" $CUSTOM_FIELDS\n" +
                "from individual i\n" +
                "         left outer join title_lineage_locations_view tllv on i.address_id = tllv.lowestpoint_id\n" +
                "         left outer join gender on i.gender_id = gender.id\n" +
                "         left outer join subject_type st on i.subject_type_id = st.id and st.is_voided is false\n";
        return super.buildUsingBaseQuery(baseQuery, "");
    }

    public SubjectSearchQueryBuilder withSubjectSearchFilter(SubjectSearchRequest request) {
        return this
                .withNameFilter(request.getName())
                .withGenderFilter(request.getGender())
                .withSubjectTypeFilter(request.getSubjectType())
                .withAgeFilter(request.getAge())
                .withRegistrationDateFilter(request.getRegistrationDate())
                .withEncounterDateFilter(request.getEncounterDate())
                .withProgramEnrolmentDateFilter(request.getProgramEnrolmentDate())
                .withProgramEncounterDateFilter(request.getProgramEncounterDate())
                .withAddressIdsFilter(request.getAddressIds())
                .withConceptsFilter(request.getConcept())
                .withIncludeVoidedFilter(request.getIncludeVoided())
                .withSearchAll(request.getSearchAll())
                .withPaginationFilters(request.getPageElement())
                .withCustomFields(request.getSubjectType());
    }

    public SubjectSearchQueryBuilder withEncounterDateFilter(DateRange encounterDateRange) {
        if (encounterDateRange == null || encounterDateRange.isEmpty()) return this;
        return withJoin(ENCOUNTER_JOIN)
                .withRangeFilter(encounterDateRange,
                        "encounterDate",
                        "e.encounter_date_time >= cast(:rangeParam as date)",
                        "e.encounter_date_time <= cast(:rangeParam as date)");
    }

    public SubjectSearchQueryBuilder withProgramEncounterDateFilter(DateRange dateRange) {
        if (dateRange == null || dateRange.isEmpty()) return this;
        return withJoin(PROGRAM_ENROLMENT_JOIN)
                .withJoin(PROGRAM_ENCOUNTER_JOIN)
                .withRangeFilter(dateRange,
                        "programEncounterDate",
                        "pe.encounter_date_time >= cast(:rangeParam as date)",
                        "pe.encounter_date_time <= cast(:rangeParam as date)");
    }

    public SubjectSearchQueryBuilder withProgramEnrolmentDateFilter(DateRange dateRange) {
        if (dateRange == null || dateRange.isEmpty()) return this;
        return withJoin(PROGRAM_ENROLMENT_JOIN)
                .withRangeFilter(dateRange,
                        "programEnrolmentDate",
                        "penr.enrolment_date_time >= cast(trim(:rangeParam) as date)",
                        "penr.enrolment_date_time <= cast(trim(:rangeParam) as date)");
    }

    @Override
    public SqlQuery getSQLResultQuery(SubjectSearchRequest searchRequest) {
        return this.withSubjectSearchFilter(searchRequest).build();
    }

    @Override
    public SqlQuery getSQLCountQuery(SubjectSearchRequest searchRequest) {
        return this.withSubjectSearchFilter(searchRequest).forCount().build();
    }
}
