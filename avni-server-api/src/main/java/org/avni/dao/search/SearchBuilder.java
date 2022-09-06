package org.avni.dao.search;

import org.avni.web.request.webapp.search.SubjectSearchRequest;

public interface SearchBuilder {
    SqlQuery getSQLResultQuery(SubjectSearchRequest searchRequest);

    SqlQuery getSQLCountQuery(SubjectSearchRequest searchRequest);
}
