package org.openchs.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.context.annotation.Profile;
import org.springframework.context.event.EventListener;

import javax.persistence.EntityManager;

@Configuration
@Profile({"dev", "live"})
public class HibernateSearchConfiguration {

    @Autowired
    EntityManager entityManager;

/* TODO: Uncomment and fix this
    @Bean
    @Lazy
    @EventListener(ApplicationReadyEvent.class)
    HibernateSearchService hibernateSearchService() {
        HibernateSearchService hibernateSearchService = new HibernateSearchService(entityManager);
        hibernateSearchService.initializeHibernateSearch();
        return hibernateSearchService;
    }
*/

}
