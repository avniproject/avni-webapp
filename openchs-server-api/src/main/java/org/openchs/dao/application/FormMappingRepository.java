package org.openchs.dao.application;

import org.openchs.application.FormMapping;
import org.openchs.application.FormMapping.FormMappingProjection;
import org.openchs.application.FormType;
import org.openchs.dao.FindByLastModifiedDateTime;
import org.openchs.dao.ReferenceDataRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RepositoryRestResource(collectionResourceRel = "formMapping", path = "formMapping")
public interface FormMappingRepository extends ReferenceDataRepository<FormMapping>, FindByLastModifiedDateTime<FormMapping> {

    Page<FormMapping> findByProgramId(Long programId, Pageable pageable);

    List<FormMapping> findByFormId(Long formId);

    List<FormMapping> findAllByProgramIdIsNotNull();

    List<FormMapping> findAllByProgramIdIsNullAndEncounterTypeIdIsNotNull();

    List<FormMapping> findAllByProgramIdIsNullAndEncounterTypeIdIsNull();

    FormMapping findByProgramIdAndEncounterTypeIdAndFormFormTypeAndIsVoidedFalse(Long programId, Long encounterTypeId, FormType formType);

    @Query("select m from FormMapping m where m.isVoided = false")
    List<FormMappingProjection> findAllOperational();

    default FormMapping findByName(String name) {
        throw new UnsupportedOperationException("No field 'name' in FormMapping");
    }

    default FormMapping findByNameIgnoreCase(String name) {
        throw new UnsupportedOperationException("No field 'name' in FormMapping");
    }
}