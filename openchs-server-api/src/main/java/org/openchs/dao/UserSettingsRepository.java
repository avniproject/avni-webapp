package org.openchs.dao;

import org.joda.time.DateTime;
import org.openchs.domain.UserSettings;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

@Repository
public interface UserSettingsRepository extends TransactionalDataRepository<UserSettings>, FindByLastModifiedDateTime<UserSettings> {
    Page<UserSettings> findByUserIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(
            long userId,
            DateTime lastModifiedDateTime,
            DateTime now,
            Pageable pageable);
}