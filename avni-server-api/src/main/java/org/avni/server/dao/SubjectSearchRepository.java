package org.avni.server.dao;

import org.avni.server.dao.search.SearchBuilder;
import org.avni.server.dao.search.SqlQuery;
import org.avni.server.web.request.webapp.search.SubjectSearchRequest;
import org.hibernate.query.internal.NativeQueryImpl;
import org.hibernate.transform.AliasToEntityMapResultTransformer;
import org.springframework.stereotype.Repository;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.Query;
import javax.transaction.Transactional;
import java.math.BigInteger;
import java.util.List;
import java.util.Map;

@Repository
public class SubjectSearchRepository {

    @PersistenceContext
    private EntityManager entityManager;

    @Transactional
    public List<Map<String,Object>> search(SubjectSearchRequest searchRequest, SearchBuilder searchBuilder) {
        SqlQuery query = searchBuilder.getSQLResultQuery(searchRequest);
        Query sql = entityManager.createNativeQuery(query.getSql());
        NativeQueryImpl nativeQuery = (NativeQueryImpl) sql;
        nativeQuery.setResultTransformer(AliasToEntityMapResultTransformer.INSTANCE);
        query.getParameters().forEach((name, value) -> {
            sql.setParameter(name, value);
        });
        return sql.getResultList();
    }

    public BigInteger getTotalCount(SubjectSearchRequest searchRequest, SearchBuilder searchBuilder) {
        SqlQuery query = searchBuilder.getSQLCountQuery(searchRequest);
        Query sql = entityManager.createNativeQuery(query.getSql());
        query.getParameters().forEach((name, value) -> {
            sql.setParameter(name, value);
        });

        return (BigInteger) sql.getSingleResult();
    }
}
