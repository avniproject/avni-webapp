package org.avni.dao.search;

import org.joda.time.DateTime;
import org.avni.web.request.webapp.search.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;

public class SubjectSearchQueryBuilder {
    private final Logger logger;

    private final String baseQuery = "select distinct i.id as id,\n" +
            "                i.first_name as firstname,\n" +
            "                i.last_name as lastname,\n" +
            "                cast(concat_ws(' ',i.first_name,i.last_name)as text) as fullname,\n" +
            "                i.uuid as uuid,\n" +
            "                cast(tllv.title_lineage as text) as title_lineage,\n" +
            "                st.name as subject_type_name,\n" +
            "                gender.name as gender_name,\n" +
            "                i.date_of_birth as date_of_birth,\n" +
            "                cast(enrolments.program_name as text) as enrolments\n" +
            "from individual i\n" +
            "         left outer join title_lineage_locations_view tllv on i.address_id = tllv.lowestpoint_id\n" +
            "         left outer join gender on i.gender_id = gender.id\n" +
            "         left outer join subject_type st on i.subject_type_id = st.id\n" +
            "         LEFT outer join individual_program_enrolment_search_view enrolments ON i.id=enrolments.individual_id \n";
    private static final String ENCOUNTER_JOIN = "left outer join encounter e\n" +
            "                         on i.id = e.individual_id and\n" +
            "                            e.encounter_date_time is not null and\n" +
            "                            e.is_voided is false";
    private static final String PROGRAM_ENROLMENT_JOIN = "left outer join program_enrolment penr on i.id = penr.individual_id and penr.is_voided is false";
    private static final String PROGRAM_ENCOUNTER_JOIN = "left outer join program_encounter pe\n" +
            "                         on penr.id = pe.program_enrolment_id and\n" +
            "                            pe.encounter_date_time is not null and\n" +
            "                            pe.is_voided is false";

    private String offsetLimitClause = "offset :offset limit :limit";
    private String orderByClause = "\norder by i.id desc\n";


    private Set<String> whereClauses = new HashSet<>();
    private Set<String> joinClauses = new HashSet<>();
    private Map<String, Object> parameters = new HashMap<>();
    private boolean forCount;

    public SubjectSearchQueryBuilder() {
        logger = LoggerFactory.getLogger(this.getClass());
    }

    public SubjectSearchQuery build() {
        StringBuffer query = new StringBuffer();
        query.append(baseQuery);
        query.append(String.join(" \n ", joinClauses));
        whereClauses.add("st.is_voided is false");
        if (!whereClauses.isEmpty()) {
            query.append("\n where \n");
        }
        query.append(String.join(" \nand ", whereClauses));
        if (parameters.get("offset") == null || parameters.get("limit") == null) {
            addDefaultPaginationFilters();
        }

        String finalQuery = "";
        if (forCount) {
            finalQuery = "select count(*) from (" + query.toString() + ") a";
            removePaginationFilters();
        } else {
            finalQuery = query.append("\n")
                    .append(orderByClause)
                    .append("\n")
                    .append(offsetLimitClause)
                    .toString();
        }

        logger.debug(finalQuery);
        logger.debug(parameters.toString());
        return new SubjectSearchQuery(finalQuery, parameters);
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
                .withPaginationFilters(request.getPageElement());
    }

    private void addDefaultPaginationFilters() {
        parameters.put("offset", 0);
        parameters.put("limit", 10);
    }

    private void removePaginationFilters() {
        parameters.remove("offset");
        parameters.remove("limit");
    }

    private SubjectSearchQueryBuilder withPaginationFilters(PageDetails pageElement) {
        int offset = 0, limit = 10;
        if (pageElement.getNumberOfRecordPerPage() != null) {
            limit = pageElement.getNumberOfRecordPerPage();
            if (pageElement.getPageNumber() != null) {
                offset = pageElement.getNumberOfRecordPerPage() * pageElement.getPageNumber();
            }
        }
        parameters.put("offset", offset);
        parameters.put("limit", limit);

        String sortColumn = pageElement.getSortColumn();
        if (sortColumn != null && !sortColumn.isEmpty()) {
            String sortOrder = pageElement.getSortOrder();
            if (sortOrder == null) {
                sortOrder = "asc";
            }

            Map<String, String> columnsMap = new HashMap<String, String>() {
                {
                    put("ID", "i.id");
                    put("FULLNAME", "concat_ws(' ',i.first_name,i.last_name)");
                    put("SUBJECTTYPE", "st.name");
                    put("GENDER", "gender.name");
                    put("DATEOFBIRTH", "i.date_of_birth");
                    put("TITLE_LINEAGE", "tllv.title_lineage");

                }
            };

            this.orderByClause = "order by " + columnsMap.get(sortColumn.toUpperCase()) + " " + sortOrder + ", i.id desc";
        }


        return this;
    }

    public SubjectSearchQueryBuilder withNameFilter(String name) {
        if (name != null && !name.isEmpty()) {
            String[] tokens = name.split("\\s+");
            StringBuffer whereClause = new StringBuffer();
            whereClause.append("(");
            List<String> clauses = new ArrayList<>();
            for (int i = 0; i < tokens.length; i++) {
                String token = "%" + tokens[i] + "%";
                String parameter = "subjectSearchToken" + i;
                addParameter(parameter, token);
                clauses.add("    i.first_name ilike :" + parameter + "\n" +
                        "        or i.last_name ilike :" + parameter + "\n" +
                        "        or i.first_name ilike :" + parameter + "\n" +
                        "        or i.last_name like :" + parameter + "");
            }
            whereClause.append(String.join(" or ", clauses));
            whereClause.append(")");
            whereClauses.add(whereClause.toString());
        }
        return this;
    }

    public SubjectSearchQueryBuilder withAgeFilter(IntegerRange ageRange) {
        if (ageRange == null || ageRange.getMinValue() == null) return this;
        parameters.put("age", ageRange.getMinValue());
        whereClauses.add("cast(date_part(cast('year' as text), age(now(), cast(i.date_of_birth as timestamp with time zone))) as numeric) = :age");
        return this;
    }

    public SubjectSearchQueryBuilder withGenderFilter(List<String> genders) {
        if (genders == null || genders.isEmpty()) return this;
        String parameter = "genders";
        addParameter(parameter, genders);
        whereClauses.add("gender.uuid in :genders");
        return this;
    }

    public SubjectSearchQueryBuilder withSubjectTypeFilter(String subjectType) {
        if (subjectType == null) return this;
        addParameter("subjectTypeUuid", subjectType);
        whereClauses.add("st.uuid = :subjectTypeUuid");
        return this;
    }

    public SubjectSearchQueryBuilder withRegistrationDateFilter(DateRange registrationDateRange) {
        if (registrationDateRange == null || registrationDateRange.isEmpty()) return this;

        return withRangeFilter(registrationDateRange,
                "registrationDate",
                "i.registration_date >= cast(:rangeParam as date)",
                "i.registration_date <= cast(:rangeParam as date)");
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

    public SubjectSearchQueryBuilder withIncludeVoidedFilter(Boolean includeVoided) {
        if (includeVoided == null) return this;
        if (!includeVoided) {
            whereClauses.add("i.is_voided is false");
        }
        return this;
    }

    public SubjectSearchQueryBuilder withAddressIdsFilter(List<Integer> addressIds) {
        if (addressIds == null || addressIds.isEmpty()) return this;
        parameters.put("addressIds", addressIds);
        whereClauses.add("i.address_id in (:addressIds)");
        return this;
    }

    public SubjectSearchQueryBuilder withSearchAll(String searchString) {
        if (searchString == null || searchString.isEmpty()) return this;
        String searchValue = "%" + searchString + "%";
        parameters.put("searchAll", searchValue);
        whereClauses.add("(cast(i.observations as text) ilike :searchAll\n" +
                " or cast(penr.observations as text) ilike :searchAll)");
        joinClauses.add(PROGRAM_ENROLMENT_JOIN);
        return this;
    }

    public SubjectSearchQueryBuilder withConceptsFilter(List<Concept> concept) {
        if (concept == null || concept.isEmpty()) return this;
        Map<String, String> aliasMap = new HashMap<String, String>() {
            {
                put("REGISTRATION", "i");
                put("PROGRAMENROLMENT", "penr");
                put("PROGRAMENCOUNTER", "pe");
                put("ENCOUNTER", "e");

            }
        };

        for (int ci = 0; ci < concept.size(); ci++) {
            Concept c = concept.get(ci);
            String conceptUuidParam = "conceptUuid" + ci;
            addParameter(conceptUuidParam, c.getUuid());
            String tableAlias = aliasMap.get(c.getSearchScope().toUpperCase());
            if (c.getSearchScope().equalsIgnoreCase("encounter")) {
                joinClauses.add(ENCOUNTER_JOIN);
            }
            if (c.getSearchScope().equalsIgnoreCase("programEnrolment")) {
                joinClauses.add(PROGRAM_ENROLMENT_JOIN);
            }
            if (c.getSearchScope().equalsIgnoreCase("programEncounter")) {
                joinClauses.add(PROGRAM_ENROLMENT_JOIN);
                joinClauses.add(PROGRAM_ENCOUNTER_JOIN);
            }

            if (c.getDataType().equalsIgnoreCase("CODED")) {
                List<String> conditions = new ArrayList<>();
                for(int i = 0; i < c.getValues().size(); i++) {
                    String value = c.getValues().get(i);
                    String param = "codedConceptValue" + ci + "00" + i;
                    addParameter(param, value);
                    String sql = "case when JSONB_TYPEOF(" + tableAlias + ".observations->:" + conceptUuidParam + ") = 'array'" +
                            "then " +
                            tableAlias + ".observations -> :" + conceptUuidParam + " @> to_jsonb(cast(:" + param + " as text)) " +
                            "else " +
                            tableAlias + ".observations ->> :" + conceptUuidParam + "= :" + param + " end";
                    conditions.add(sql);
                }
                String codedFilter = String.join(" or ", conditions);
                whereClauses.add("(" + codedFilter + ")");
            }

            if (c.getDataType().equalsIgnoreCase("TEXT")) {
                String value = "%" + c.getValue() + "%";
                String param = "textValue" + ci;
                addParameter(param, value);
                whereClauses.add(tableAlias + ".observations->> :" + conceptUuidParam + " ilike :" + param);
            }

            if (c.getDataType().equalsIgnoreCase("NUMERIC")) {
                if (c.getWidget() != null && c.getWidget().equalsIgnoreCase("RANGE")) {
                    if (c.getMinValue() != null && !c.getMinValue().isEmpty()) {
                        Float value = Float.parseFloat(c.getMinValue());
                        String param = "numericValueMin" + ci;
                        addParameter(param, value);
                        whereClauses.add("cast(" + tableAlias + ".observations ->> :" + conceptUuidParam + " as numeric)  >= :" + param);
                    }
                    if (c.getMaxValue() != null && !c.getMaxValue().isEmpty()) {
                        Float value = Float.parseFloat(c.getMaxValue());
                        String param = "numericValueMax" + ci;
                        addParameter(param, value);
                        whereClauses.add("cast(" + tableAlias + ".observations ->>:" + conceptUuidParam + " as numeric)  <= :" + param);
                    }
                } else {
                    Float value = Float.parseFloat(c.getMinValue());
                    String param = "numericValueMin" + ci;
                    addParameter(param, value);
                    whereClauses.add("cast(" + tableAlias + ".observations ->>:" + conceptUuidParam + " as numeric)  = :" + param );
                }
            }

            if (c.getDataType().equalsIgnoreCase("DATE")) {
                if (c.getWidget() != null && c.getWidget().equalsIgnoreCase("RANGE")) {
                    if (c.getMinValue() != null && !c.getMinValue().isEmpty()) {
                        String value = c.getMinValue();
                        String param = "dateTimeValueMin" + ci;
                        addParameter(param, value);
                        whereClauses.add("cast(" + tableAlias + ".observations ->>:" + conceptUuidParam + " as date)  >= cast(:" + param + " as date)");
                    }
                    if (c.getMaxValue() != null && !c.getMaxValue().isEmpty()) {
                        String value = c.getMaxValue();
                        String param = "dateTimeValueMax" + ci;
                        addParameter(param, value);
                        whereClauses.add("cast(" + tableAlias + ".observations ->>:" + conceptUuidParam + " as date)  <= cast(:" + param + " as date)");
                    }
                } else {
                    String value = c.getMinValue();
                    String param = "dateTimeValueMin" + ci;
                    addParameter(param, value);
                    whereClauses.add("cast(" + tableAlias + ".observations ->>:" + conceptUuidParam + " as date)  = cast(:" + param + " as date)");
                }
            }
        }

        return this;
    }

    private SubjectSearchQueryBuilder withJoin(String joinClause) {
        joinClauses.add(joinClause);
        return this;
    }

    private SubjectSearchQueryBuilder withRangeFilter(RangeFilter rangeFilter, String parameterPrefix, String minFilter, String maxFilter) {
        if (rangeFilter == null) return this;
        if (rangeFilter.getMinValue() != null) {
            String parameter = parameterPrefix + "Min";
            addParameter(parameter, rangeFilter.getMinValue());
            whereClauses.add(minFilter.replace("rangeParam", parameter));
        }
        if (rangeFilter.getMaxValue() != null) {
            String parameter = parameterPrefix + "Max";
            addParameter(parameter, rangeFilter.getMaxValue());
            whereClauses.add(maxFilter.replace("rangeParam", parameter));
        }
        return this;
    }

    private void addParameter(String name, Object value) {
        parameters.put(name, value);
    }

    public SubjectSearchQueryBuilder forCount() {
        this.forCount = true;
        return this;
    }
}
