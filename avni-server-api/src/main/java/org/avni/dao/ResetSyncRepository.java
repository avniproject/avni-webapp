package org.avni.dao;

import org.avni.domain.ResetSync;
import org.avni.domain.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.Date;

@Repository
public interface ResetSyncRepository extends TransactionalDataRepository<ResetSync> {

    Page<ResetSync> findAllByUserIsNullOrUserAndLastModifiedDateTimeBetweenOrderByLastModifiedDateTimeAscIdAsc(
            User user,
            Date lastModifiedDateTime,
            Date now,
            Pageable pageable
    );
}
