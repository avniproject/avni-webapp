package org.avni.server.dao;

import org.avni.server.domain.AddressLevelType;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.data.rest.core.annotation.RestResource;
import org.springframework.stereotype.Repository;

import javax.validation.constraints.NotNull;
import java.util.Collection;
import java.util.List;

@Repository
@RepositoryRestResource(collectionResourceRel = "addressLevelType", path = "addressLevelType")
public interface AddressLevelTypeRepository extends ReferenceDataRepository<AddressLevelType> {

    AddressLevelType findByNameAndOrganisationId(String name, Long organisationId);
    AddressLevelType findByNameIgnoreCaseAndOrganisationIdAndIsVoidedFalse(String name, Long organisationId);

    @RestResource(path = "findAllById", rel = "findAllById")
    List<AddressLevelType> findByIdIn(@Param("ids") Long[] ids);

    List<AddressLevelType> findAllByIdIn(Collection<Long> id);

    List<AddressLevelType> findAllByUuidIn(Collection<String> UUIDs);

    @Query("select a.name from AddressLevelType a where a.isVoided = false")
    List<String> getAllNames();

    @Query(value = "select * from address_level_type where id not in (select distinct parent_id from address_level_type where parent_id is not null) and is_voided = false", nativeQuery = true)
    List<AddressLevelType> getAllLowestAddressLevelTypes();

    List<AddressLevelType> findByUuidIn(Collection<@NotNull String> uuid);

    AddressLevelType findByParent(AddressLevelType parent);

    List<AddressLevelType> findByIsVoidedFalseAndNameIgnoreCaseContains(String name);
}
