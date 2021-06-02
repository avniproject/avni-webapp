package org.openchs.dao;

import org.openchs.dao.search.SubjectSearchQuery;
import org.openchs.dao.search.SubjectSearchQueryBuilder;
import org.openchs.web.request.webapp.search.SubjectSearchRequest;
import org.springframework.stereotype.Repository;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.Query;
import javax.transaction.Transactional;
import java.math.BigInteger;
import java.util.List;

@Repository
@Transactional
public class SubjectSearchRepository {

    @PersistenceContext
    private EntityManager entityManager;

    @Transactional
    public List<Object[]> search(SubjectSearchRequest searchRequest) {
        SubjectSearchQuery query = new SubjectSearchQueryBuilder()
                .withSubjectSearchFilter(searchRequest)
                .build();
        Query sql = entityManager.createNativeQuery(query.getSql());
        query.getParameters().forEach((name, value) -> {
            sql.setParameter(name, value);
        });
        return sql.getResultList();
    }

    public BigInteger getTotalCount(SubjectSearchRequest searchRequest) {
        SubjectSearchQuery query = new SubjectSearchQueryBuilder()
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
