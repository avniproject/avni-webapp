package org.openchs.dao.application;

import org.openchs.application.Form;
import org.openchs.dao.FindByLastModifiedDateTime;
import org.openchs.dao.ReferenceDataRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.data.rest.core.annotation.RestResource;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RepositoryRestResource(collectionResourceRel = "form", path = "form")
public interface FormRepository extends ReferenceDataRepository<Form>, FindByLastModifiedDateTime<Form> {

    @RestResource(exported = false)
    List<Form> findAllByOrganisationId(Long organisationId);
    @RestResource(exported = false) 
    Page<Form> findAllByOrganisationId(Long organisationId, Pageable pageable);
    @RestResource(exported = false)
    Page<Form> findByOrganisationIdAndNameIgnoreCaseContaining(Long organisationId, String name, Pageable pageable);


    @Query("select f.name from Form f where f.isVoided = false")
    List<String> getAllNames();
}