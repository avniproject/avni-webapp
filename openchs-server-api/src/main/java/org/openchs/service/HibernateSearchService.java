package org.openchs.service;

import org.apache.lucene.analysis.core.StopAnalyzer;
import org.apache.lucene.search.Query;
import org.hibernate.search.jpa.FullTextEntityManager;
import org.hibernate.search.jpa.FullTextQuery;
import org.hibernate.search.jpa.Search;
import org.hibernate.search.query.dsl.QueryBuilder;
import org.openchs.domain.Concept;
import org.openchs.web.request.ConceptContract;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.PostConstruct;
import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import java.util.ArrayList;
import java.util.List;

@Service
public class HibernateSearchService {
    private final EntityManager entityManager;

    @Autowired
    public HibernateSearchService(EntityManagerFactory entityManagerFactory) {
        this.entityManager = entityManagerFactory.createEntityManager();
    }

    @PostConstruct
    void init() {
        Search.getFullTextEntityManager(entityManager).createIndexer().start();
    }

    @Transactional
    public List<ConceptContract> searchConcepts(String searchTerm, String dataType) {

        if (searchTerm.length() < 2 || StopAnalyzer.ENGLISH_STOP_WORDS_SET.contains(searchTerm))
            return new ArrayList<>();

        FullTextEntityManager fullTextEntityManager = Search.getFullTextEntityManager(entityManager);

        QueryBuilder qb = fullTextEntityManager.getSearchFactory()
                .buildQueryBuilder()
                .forEntity(Concept.class)
                .overridesForField("name", "edgeNGram_query")
                .get();

        Query luceneQuery = qb
                .phrase()
                .withSlop(3)
                .onField("name")
                .sentence(searchTerm)
                .createQuery();

        FullTextQuery jpaQuery = fullTextEntityManager.createFullTextQuery(luceneQuery, Concept.class);

        List resultList = jpaQuery.getResultList();
        List<ConceptContract> searchResult = new ArrayList<>();
        resultList.forEach(o -> {
            if (dataType == null) {
                searchResult.add(((Concept) o).toConceptContract());
            } else {
                Concept concept = (Concept) o;
                if (concept.getDataType().equals(dataType)) {
                    searchResult.add(((Concept) o).toConceptContract());
                }
            }
        });

        return searchResult;
    }
}
