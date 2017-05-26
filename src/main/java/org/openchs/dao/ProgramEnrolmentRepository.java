package org.openchs.dao;

import org.joda.time.DateTime;
import org.openchs.domain.Individual;
import org.openchs.domain.ProgramEnrolment;
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
@RepositoryRestResource(collectionResourceRel = "programEnrolment", path = "programEnrolment")
public interface ProgramEnrolmentRepository extends PagingAndSortingRepository<ProgramEnrolment, Long>, CHSRepository<ProgramEnrolment> {
    @RestResource(path = "lastModified", rel = "lastModified")
    Page<ProgramEnrolment> findByLastModifiedDateTimeGreaterThanOrderById(@Param("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime, Pageable pageable);

    @RestResource(path = "byIndividualsOfCatchmentAndLastModified", rel = "byIndividualsOfCatchmentAndLastModified")
    Page<ProgramEnrolment> findByIndividualAddressLevelCatchmentsIdAndLastModifiedDateTimeGreaterThanOrderById(@Param("catchmentId") long catchmentId, @Param("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime, Pageable pageable);

}