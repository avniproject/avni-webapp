package org.avni.dao.program;

import org.avni.dao.CHSRepository;
import org.avni.dao.OperatingIndividualScopeAwareRepository;
import org.avni.dao.SyncParameters;
import org.avni.dao.TransactionalDataRepository;
import org.avni.domain.Concept;
import org.avni.domain.Encounter;
import org.avni.domain.EncounterType;
import org.avni.domain.Individual;
import org.avni.domain.program.SubjectProgramEligibility;
import org.joda.time.DateTime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

import javax.persistence.criteria.*;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Map;

@Repository
@RepositoryRestResource(collectionResourceRel = "subjectProgramEligibility", path = "subjectProgramEligibility", exported = false)
@PreAuthorize("hasAnyAuthority('user','admin')")
public interface SubjectProgramEligibilityRepository extends CHSRepository<SubjectProgramEligibility> {
    Page<SubjectProgramEligibility> findByLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(
            Date lastModifiedDateTime, Date now, Pageable pageable);
}

