package org.avni.server.dao.search;

import org.avni.server.domain.Concept;
import org.avni.server.framework.security.UserContextHolder;
import org.avni.server.web.api.EncounterSearchRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Pageable;

import java.util.*;

public class EncounterSearchQueryBuilder {
    private final Logger logger;

    private final String baseQuery = "select e.*\n" +
            "from encounter e\n";

    private String offsetLimitClause = "offset :offset limit :limit";

    private Set<String> whereClauses = new HashSet<>();
    private Set<String> joinClauses = new HashSet<>();
    private String orderByString = "order by e.last_modified_date_time asc, e.id asc";
    private Map<String, Object> parameters = new HashMap<>();
    private boolean forCount;

    public EncounterSearchQueryBuilder() {
        logger = LoggerFactory.getLogger(this.getClass());
    }

    public SqlQuery build() {
        addParameter("organisationId", UserContextHolder.getOrganisation().getId());
        whereClauses.add("e.organisation_id = :organisationId");
        StringBuffer query = new StringBuffer();
        query.append(baseQuery);
        query.append(String.join(" \n ", joinClauses));
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
                    .append("\n")
                    .append(orderByString)
                    .append("\n")
                    .append(offsetLimitClause)
                    .toString();
        }
        logger.debug(finalQuery);
        logger.debug(parameters.toString());
        return new SqlQuery(finalQuery, parameters);
    }

    private void addDefaultPaginationFilters() {
        addParameter("offset", 0);
        addParameter("limit", 10);
    }

    private void removePaginationFilters() {
        parameters.remove("offset");
        parameters.remove("limit");
    }

    public EncounterSearchQueryBuilder withRequest(EncounterSearchRequest encounterSearchRequest) {
        return withPaginationFilters(encounterSearchRequest.getPageable())
                .withConceptsMap(encounterSearchRequest.getConceptsMap())
                .withEncounterType(encounterSearchRequest.getEncounterType())
                .withLastModifiedDateTimeBetween(encounterSearchRequest.getLastModifiedDateTime(), encounterSearchRequest.getNow())
                .withSubjectUuid(encounterSearchRequest.getSubjectUUID())
                .withPaginationFilters(encounterSearchRequest.getPageable());
    }

    public EncounterSearchQueryBuilder withPaginationFilters(Pageable pageElement) {
        Integer pageSize = pageElement.getPageSize();
        addParameter("offset", pageSize * (Integer) pageElement.getPageNumber());
        addParameter("limit", pageSize);

        return this;
    }

    private EncounterSearchQueryBuilder withLastModifiedDateTimeBetween(Date from, Date to) {
        if (from == null || to == null) return this;

        addParameter("fromDate", from);
        addParameter("toDate", to);
        whereClauses.add("e.last_modified_date_time between :fromDate and :toDate");
        return this;
    }

    private EncounterSearchQueryBuilder withEncounterType(String encounterType) {
        if (encounterType == null || encounterType.trim().isEmpty()) return this;

        withJoin("inner join encounter_type et on e.encounter_type_id = et.id");
        addParameter("encounterType", encounterType);
        whereClauses.add("et.name = :encounterType");
        return this;
    }

    public EncounterSearchQueryBuilder withSubjectUuid(String subjectUuid) {
        if (subjectUuid == null || subjectUuid.trim().isEmpty()) return this;

        withJoin("inner join individual i on e.individual_id = i.id");
        addParameter("subject", subjectUuid);
        whereClauses.add("i.uuid = :subject");
        return this;
    }

    public EncounterSearchQueryBuilder withConceptsMap(Map<Concept, String> conceptsMap) {
        if (conceptsMap == null) return this;

        Set<Map.Entry<Concept, String>> entries = conceptsMap.entrySet();
        conceptsMap.entrySet().stream().forEach(entry -> {
            whereClauses.add(String.format("e.observations @> cast ('{\"%s\":\"%s\"}' as jsonb)", entry.getKey().getUuid(), entry.getValue()));
        });
        return this;
    }

    private EncounterSearchQueryBuilder withJoin(String joinClause) {
        joinClauses.add(joinClause);
        return this;
    }

    private void addParameter(String name, Object value) {
        parameters.put(name, value);
    }

    public EncounterSearchQueryBuilder forCount() {
        this.forCount = true;
        return this;
    }
}
