package org.avni.server.dao;

import org.avni.server.domain.CustomQuery;
import org.avni.server.web.request.CustomQueryRequest;
import org.avni.server.web.response.CustomQueryResponse;
import org.flywaydb.core.internal.util.ExceptionUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class QueryRepository {

    //TODO: this jdbcTemplate should come from custom bean having max rows and query timeout set
    private final NamedParameterJdbcTemplate jdbcTemplate;
    private final CustomQueryRepository customQueryRepository;

    @Autowired
    public QueryRepository(NamedParameterJdbcTemplate jdbcTemplate,
                           CustomQueryRepository customQueryRepository) {
        this.jdbcTemplate = jdbcTemplate;
        this.customQueryRepository = customQueryRepository;
    }

    public ResponseEntity<?> runQuery(CustomQueryRequest customQueryRequest) {
        CustomQuery customQuery = customQueryRepository.findAllByName(customQueryRequest.getName());
        if (customQuery == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(String.format("Query not found with name %s", customQueryRequest.getName()));
        }
        try {
            List<Map<String, Object>> queryResult = jdbcTemplate.queryForList(customQuery.getQuery(), customQueryRequest.getQueryParams());
            return ResponseEntity.ok(new CustomQueryResponse(queryResult));
        } catch (DataAccessException e) {
            String errorMessage = ExceptionUtils.getRootCause(e).getMessage();
            if (errorMessage.equals("ERROR: canceling statement due to user request")) {
                errorMessage = "Query took more time to return the result";
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(String.format("Error while executing the query message : \"%s\"", errorMessage));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(String.format("Encountered some error while executing the query message %s", e.getMessage()));
        }
    }
}
