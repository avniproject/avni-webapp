package org.openchs.service;

import javax.persistence.EntityManager;

import org.apache.lucene.search.Query;
import org.hibernate.search.jpa.FullTextQuery;
import org.hibernate.search.jpa.FullTextEntityManager;
import org.hibernate.search.jpa.Search;
import org.hibernate.search.query.dsl.QueryBuilder;

import org.openchs.web.request.ConceptContract;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import org.openchs.domain.Concept;

@Service
public class HibernateSearchService {
    private final EntityManager entityManager;
    private final Logger logger;

    @Autowired
    public HibernateSearchService(EntityManager entityManager) {
        super();
        this.entityManager = entityManager;
        logger = LoggerFactory.getLogger(this.getClass());
    }

    void initializeHibernateSearch() {
        FullTextEntityManager fullTextEntityManager = Search.getFullTextEntityManager(entityManager);
        fullTextEntityManager.createIndexer().start();
    }

    @Transactional
    public List<ConceptContract> searchConcepts(String searchTerm) {
        FullTextEntityManager fullTextEntityManager = Search.getFullTextEntityManager(entityManager);

        QueryBuilder qb = fullTextEntityManager.getSearchFactory()
                                                .buildQueryBuilder()
                                                .forEntity(Concept.class).get();

        Query luceneQuery = qb.keyword()
                            .onFields("name")
                            .matching(searchTerm)
                            .createQuery();

        FullTextQuery jpaQuery = fullTextEntityManager.createFullTextQuery(luceneQuery, Concept.class);

        List resultList = jpaQuery.getResultList();
        List<ConceptContract> searchResult = new ArrayList<>();
        resultList.forEach(o -> searchResult.add(((Concept)o).toConceptContract()));

        return searchResult;
    }
}
