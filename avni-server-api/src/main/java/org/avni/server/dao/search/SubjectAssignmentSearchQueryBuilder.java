package org.avni.server.dao.search;

import org.avni.server.dao.SubjectTypeRepository;
import org.avni.server.domain.SubjectType;
import org.avni.server.framework.ApplicationContextProvider;
import org.avni.server.service.ConceptService;
import org.avni.server.web.request.webapp.search.SubjectSearchRequest;
import org.joda.time.DateTime;

import java.util.List;

public class SubjectAssignmentSearchQueryBuilder extends BaseSubjectSearchQueryBuilder<SubjectAssignmentSearchQueryBuilder> implements SearchBuilder {

    public SqlQuery build() {
        String SUBJECT_ASSIGNMENT_SEARCH_BASE_QUERY = "select i.id                                                                   as \"id\",\n" +
                "       cast(concat_ws(' ', i.first_name, i.middle_name, i.last_name) as text) as \"fullName\",\n" +
                "       i.uuid                                                                 as \"uuid\",\n" +
                "       cast(tllv.title_lineage as text)                                       as \"addressLevel\",\n" +
                "       string_agg(distinct p.name || ':' || p.colour, ', ')                   as \"programs\",\n" +
                "       string_agg(distinct assigned_to.name || ':' || g.name, ', ')           as \"assignedTo\"\n" +
                "       $CUSTOM_FIELDS\n" +
                "from individual i\n" +
                "         left outer join title_lineage_locations_view tllv on i.address_id = tllv.lowestpoint_id\n" +
                "         left outer join subject_type st on i.subject_type_id = st.id and st.is_voided is false\n" +
                "         left outer join program_enrolment penr on i.id = penr.individual_id and penr.is_voided is false\n" +
                "         left outer join program p on p.id = penr.program_id\n" +
                "         left outer join user_subject_assignment usa on usa.subject_id = i.id and usa.is_voided is false\n" +
                "         left outer join users assigned_to on usa.user_id = assigned_to.id\n" +
                "         left outer join user_group ug on ug.user_id = assigned_to.id and ug.is_voided is false\n" +
                "         left outer join groups g on g.id = ug.group_id and g.is_voided is false\n";
        return super.buildUsingBaseQuery(SUBJECT_ASSIGNMENT_SEARCH_BASE_QUERY, "\n group by 1, 2, 3, 4");
    }

    public SubjectAssignmentSearchQueryBuilder withSubjectSearchFilter(SubjectSearchRequest request) {
        return this
                .withNameFilter(request.getName())
                .withSubjectTypeFilter(request.getSubjectType())
                .withAddressIdsFilter(request.getAddressIds())
                .withPaginationFilters(request.getPageElement())
                .programFilter(request.getPrograms())
                .createdOnFilter(request.getCreatedOn())
                .assignedToFilter(request.getAssignedTo())
                .userGroupFilter(request.getUserGroup(), request.getAssignedTo())
                .withSyncAttributes(request.getSubjectType())
                .withConceptsFilter(request.getConcept());
    }

    public SubjectAssignmentSearchQueryBuilder withSubjectTypeFilter(String subjectTypeUUID) {
        if (subjectTypeUUID == null) return this;
        SubjectTypeRepository subjectTypeRepository = ApplicationContextProvider.getContext().getBean(SubjectTypeRepository.class);
        SubjectType subjectType = subjectTypeRepository.findByUuid(subjectTypeUUID);
        addParameter("subjectTypeId", subjectType.getId());
        addWhereClauses("st.id = :subjectTypeId");
        return this;
    }

    public SubjectAssignmentSearchQueryBuilder withSyncAttributes(String subjectTypeUUID) {
        SubjectTypeRepository subjectTypeRepository = ApplicationContextProvider.getContext().getBean(SubjectTypeRepository.class);
        ConceptService conceptService = ApplicationContextProvider.getContext().getBean(ConceptService.class);
        SubjectType subjectType = subjectTypeRepository.findByUuid(subjectTypeUUID);
        if (subjectType.getSyncRegistrationConcept1() != null) {
            this.addCustomFields(conceptService.get(subjectType.getSyncRegistrationConcept1()));
        }
        if (subjectType.getSyncRegistrationConcept2() != null) {
            this.addCustomFields(conceptService.get(subjectType.getSyncRegistrationConcept2()));
        }
        return this;
    }


    public SubjectAssignmentSearchQueryBuilder programFilter(List<String> programUUIDs) {
        if (programUUIDs == null || programUUIDs.isEmpty()) return this;
        addParameter("programUuids", programUUIDs);
        addWhereClauses("p.uuid in (:programUuids)");
        return this;
    }

    public SubjectAssignmentSearchQueryBuilder createdOnFilter(DateTime createdOn) {
        if (createdOn == null) return this;
        addParameter("createdOn", createdOn.millisOfDay().withMinimumValue().toString());
        addParameter("today", new DateTime().millisOfDay().withMaximumValue().toString());
        addWhereClauses("i.created_date_time between cast(:createdOn as timestamptz) and cast(:today as timestamptz)");
        return this;
    }

    public SubjectAssignmentSearchQueryBuilder assignedToFilter(String userUUID) {
        if (userUUID == null) return this;
        if (userUUID.equals("0")) {
            addWhereClauses("usa.user_id is null");
        } else {
            addParameter("userUUID", userUUID);
            addWhereClauses("assigned_to.uuid = :userUUID");
            addWhereClauses("usa.user_id is not null");
        }
        return this;
    }

    public SubjectAssignmentSearchQueryBuilder userGroupFilter(String groupUUID, String userUUID) {
        if (groupUUID == null) return this;
        addParameter("groupUUID", groupUUID);
        if (userUUID != null && userUUID.equals("0")) {
            removeWhereClause("usa.user_id is null");
            addWhereClauses("(ug.id isnull or g.uuid <> :groupUUID)");
        } else {
            addWhereClauses("g.uuid = :groupUUID");
            addWhereClauses("usa.user_id is not null");
        }
        return this;
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
