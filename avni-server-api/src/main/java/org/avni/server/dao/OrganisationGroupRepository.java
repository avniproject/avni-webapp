package org.avni.server.dao;

import org.avni.server.domain.OrganisationGroup;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.stereotype.Repository;

@Repository
@RepositoryRestResource(collectionResourceRel = "organisationGroup", path = "organisationGroup")
public interface OrganisationGroupRepository extends CrudRepository<OrganisationGroup, Long>, PagingAndSortingRepository<OrganisationGroup, Long> {

    OrganisationGroup findByName(String orgGroupName);

    default OrganisationGroup findOne(Long id){
        return findById(id).orElse(null);
    }

    Page<OrganisationGroup> findByAccount_AccountAdmin_User_Id(Long userId, Pageable pageable);

    OrganisationGroup findByIdAndAccount_AccountAdmin_User_Id(Long id, Long userId);

}
