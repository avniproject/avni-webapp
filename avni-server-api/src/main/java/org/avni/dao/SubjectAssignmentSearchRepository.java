package org.avni.dao;

import org.avni.dao.search.SqlQuery;
import org.avni.dao.search.SubjectAssignmentSearchQueryBuilder;
import org.avni.web.request.webapp.search.SubjectSearchRequest;
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
public class SubjectAssignmentSearchRepository {

    @PersistenceContext
    private EntityManager entityManager;

    @Transactional
    public List<Map<String,Object>> search(SubjectSearchRequest searchRequest) {
        SqlQuery query = new SubjectAssignmentSearchQueryBuilder()
                .withSubjectSearchFilter(searchRequest)
                .build();
        Query sql = entityManager.createNativeQuery(query.getSql());
        NativeQueryImpl nativeQuery = (NativeQueryImpl) sql;
        nativeQuery.setResultTransformer(AliasToEntityMapResultTransformer.INSTANCE);
        query.getParameters().forEach((name, value) -> {
            sql.setParameter(name, value);
        });

        return sql.getResultList();
    }

    public BigInteger getTotalCount(SubjectSearchRequest searchRequest) {
        SqlQuery query = new SubjectAssignmentSearchQueryBuilder()
                .withSubjectSearchFilter(searchRequest)
                .forCount()
                .build();
        Query sql = entityManager.createNativeQuery(query.getSql());
        query.getParameters().forEach((name, value) -> {
            sql.setParameter(name, value);
        });

        return (BigInteger) sql.getSingleResult();
    }
}
