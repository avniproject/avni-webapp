package org.avni.server.dao.search;

import org.avni.server.web.request.webapp.search.SubjectSearchRequest;

public interface SearchBuilder {
    SqlQuery getSQLResultQuery(SubjectSearchRequest searchRequest);

    SqlQuery getSQLCountQuery(SubjectSearchRequest searchRequest);
}
