package org.openchs.dao;

import org.openchs.domain.AddressLevelType;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.data.rest.core.annotation.RestResource;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RepositoryRestResource(collectionResourceRel = "addressLevelType", path = "addressLevelType")
public interface AddressLevelTypeRepository extends ReferenceDataRepository<AddressLevelType> {

    AddressLevelType findByNameAndOrganisationId(String name, Long organisationId);
    AddressLevelType findByNameIgnoreCaseAndOrganisationId(String name, Long organisationId);

    @RestResource(path = "findAllById", rel = "findAllById")
    List<AddressLevelType> findByIdIn(@Param("ids") Long[] ids);

    @Query("select a.name from AddressLevelType a where a.isVoided = false")
    List<String> getAllNames();

    @Query("select st from AddressLevelType st where st.voided = false and st.id not in (select distinct parent from AddressLevelType d where d.parent is not null)")
    List<AddressLevelType> getAllLowestAddressLevelTypes();
}
