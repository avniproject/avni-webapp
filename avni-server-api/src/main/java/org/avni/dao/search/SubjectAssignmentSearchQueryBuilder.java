package org.avni.dao.search;

import org.avni.dao.SubjectTypeRepository;
import org.avni.domain.Concept;
import org.avni.domain.SubjectType;
import org.avni.framework.ApplicationContextProvider;
import org.avni.service.ConceptService;
import org.avni.service.OrganisationConfigService;
import org.avni.web.request.webapp.search.SubjectSearchRequest;
import org.joda.time.DateTime;

import java.util.HashSet;
import java.util.Set;

public class SubjectAssignmentSearchQueryBuilder extends BaseSubjectSearchQueryBuilder<SubjectAssignmentSearchQueryBuilder> {

    public SqlQuery build() {
        String SUBJECT_ASSIGNMENT_SEARCH_BASE_QUERY = "select i.id                                                                   as \"id\",\n" +
                "       cast(concat_ws(' ', i.first_name, i.middle_name, i.last_name) as text) as \"fullName\",\n" +
                "       i.uuid                                                                 as \"uuid\",\n" +
                "       cast(tllv.title_lineage as text)                                       as \"addressLevel\",\n" +
                "       string_agg(distinct p.name, ', ')                                      as \"programs\",\n" +
                "       string_agg(distinct u.name || ':' || g.name, ', ')                     as \"assignedTo\"\n" +
                "       $CUSTOM_FIELDS\n" +
                "from individual i\n" +
                "         left outer join title_lineage_locations_view tllv on i.address_id = tllv.lowestpoint_id\n" +
                "         left outer join subject_type st on i.subject_type_id = st.id\n" +
                "         left outer join program_enrolment penr on i.id = penr.individual_id and penr.is_voided is false\n" +
                "         left outer join program p on p.id = penr.program_id\n" +
                "         left outer join user_subject_assignment usa on usa.subject_id = i.id\n" +
                "         left outer join users u on usa.user_id = u.id\n" +
                "         left outer join user_group ug on ug.user_id = u.id\n" +
                "         left outer join groups g on g.id = ug.group_id";
        return super.buildUsingBaseQuery(SUBJECT_ASSIGNMENT_SEARCH_BASE_QUERY, "\n group by 1, 2, 3, 4");
    }

    public SubjectAssignmentSearchQueryBuilder withSubjectSearchFilter(SubjectSearchRequest request) {
        return this
                .withNameFilter(request.getName())
                .withSubjectTypeFilter(request.getSubjectType())
                .withAddressIdsFilter(request.getAddressIds())
                .withPaginationFilters(request.getPageElement())
                .programFilter(request.getProgram())
                .createdOnFilter(request.getCreatedOn())
                .assignedToFilter(request.getAssignedTo())
                .userGroupFilter(request.getUserGroup())
                .withSyncAttributes(request.getSubjectType())
                .withConceptsFilter(request.getConcept());
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


    public SubjectAssignmentSearchQueryBuilder programFilter(String programUUID) {
        if (programUUID == null) return this;
        addParameter("programUuid", programUUID);
        addWhereClauses("p.uuid = :programUuid");
        return this;
    }

    public SubjectAssignmentSearchQueryBuilder createdOnFilter(DateTime createdOn) {
        if (createdOn == null) return this;
        addParameter("createdOn", createdOn.toString());
        addParameter("today", new DateTime().toString());
        addWhereClauses("i.created_date_time between cast(:createdOn as date) and cast(:today as date)");
        return this;
    }

    public SubjectAssignmentSearchQueryBuilder assignedToFilter(String userUUID) {
        if (userUUID == null) return this;
        if (userUUID.equals("0")) {
            addWhereClauses("usa.user_id is null");
        } else {
            addParameter("userUUID", userUUID);
            addWhereClauses("u.uuid = :userUUID");
            addWhereClauses("usa.user_id is not null");
        }
        return this;
    }

    public SubjectAssignmentSearchQueryBuilder userGroupFilter(String userGroupUUID) {
        if (userGroupUUID == null) return this;
        addParameter("userGroupUUID", userGroupUUID);
        addWhereClauses("ug.uuid = :userGroupUUID");
        addWhereClauses("usa.user_id is not null");
        return this;
    }
}
