package org.openchs.dao;

import org.joda.time.DateTime;
import org.openchs.domain.Checklist;
import org.openchs.domain.ProgramEncounter;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.data.rest.core.annotation.RestResource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.stereotype.Repository;

import javax.transaction.Transactional;

@Transactional
@Repository
@RepositoryRestResource(collectionResourceRel = "checklist", path = "checklist")
public interface ChecklistRepository extends PagingAndSortingRepository<Checklist, Long>, CHSRepository<Checklist> {
    @RestResource(path = "byIndividualsOfCatchmentAndLastModified", rel = "byIndividualsOfCatchmentAndLastModified")
    Page<Checklist> findByProgramEnrolmentIndividualAddressLevelCatchmentsIdAndLastModifiedDateTimeGreaterThanOrderByLastModifiedDateTimeAscIdAsc(@Param("catchmentId") long catchmentId, @Param("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime, Pageable pageable);
}