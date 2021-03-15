package org.openchs.dao;

import org.joda.time.DateTime;
import org.openchs.domain.News;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.stereotype.Repository;

@Repository
@RepositoryRestResource(collectionResourceRel = "news", path = "news")
public interface NewsRepository extends TransactionalDataRepository<News>, FindByLastModifiedDateTime<News> {

    News findByTitleAndIsVoidedFalse(String title);

    Page<News> findByPublishedDateNotNullAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(DateTime lastModifiedDateTime, DateTime now, Pageable pageable);
}

