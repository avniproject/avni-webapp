package org.avni.dao.search;

import java.util.Map;

public class SubjectSearchQuery {
    private String query;
    private Map<String, Object> parameters;

    public SubjectSearchQuery(String query, Map<String, Object> parameters) {
        this.query = query;
        this.parameters = parameters;
    }

    public String getSql() {
        return query;
    }

    public Map<String, Object> getParameters() {
        return parameters;
    }
}
