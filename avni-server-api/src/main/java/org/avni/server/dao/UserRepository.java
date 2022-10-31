package org.avni.server.dao;

import org.avni.server.domain.Catchment;
import org.avni.server.domain.User;
import org.avni.server.projection.UserWebProjection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.data.rest.core.annotation.RestResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

import org.joda.time.DateTime;
import java.util.List;

@Repository
@RepositoryRestResource(collectionResourceRel = "user", path = "user")
@PreAuthorize("hasAnyAuthority('admin','organisation_admin')")
public interface UserRepository extends PagingAndSortingRepository<User, Long>, JpaSpecificationExecutor<User> {
    User findByUsername(String username);
    User findByUuid(String uuid);

    default User findOne(Long id) {
        return findById(id).orElse(null);
    }

    @PreAuthorize("hasAnyAuthority('admin', 'user')")
    User save(User user);

    @RestResource(path = "findByOrganisation", rel = "findByOrganisation")
    Page<User> findByOrganisationIdAndIsVoidedFalse(@Param("organisationId") Long organisationId,
                                                    Pageable pageable);

    @RestResource(path = "findAllById", rel = "findAllById")
    List<User> findByIdIn(@Param("ids") Long[] ids);

    List<UserWebProjection> findAllByOrganisationIdAndIsVoidedFalse(Long organisationId);

    @Query(value = "SELECT u FROM User u left join u.accountAdmin as aa " +
            "where u.isVoided = false and " +
            "(((:organisationIds) is not null and u.organisationId in (:organisationIds) and u.isOrgAdmin = true) or aa.account.id in (:accountIds)) " +
            "and (:username is null or u.username like %:username%) " +
            "and (:name is null or u.name like %:name%) " +
            "and (:email is null or u.email like %:email%) " +
            "and (:phoneNumber is null or u.phoneNumber like %:phoneNumber%)")
    Page<User> findAccountAndOrgAdmins(String username, String name, String email, String phoneNumber, List<Long> accountIds, List<Long> organisationIds, Pageable pageable);

    @Query(value = "SELECT u FROM User u left join u.accountAdmin as aa " +
            "where u.id=:id and u.isVoided = false and " +
            "(((:organisationIds) is not null and u.organisationId in (:organisationIds) and u.isOrgAdmin = true) or aa.account.id in (:accountIds))")
    User getOne(Long id, List<Long> accountIds, List<Long> organisationIds);

    @PreAuthorize("hasAnyAuthority('user')")
    boolean existsByLastModifiedDateTimeGreaterThan(DateTime lastModifiedDateTime);

    List<User> findByCatchment_IdInAndIsVoidedFalse(List<Long> catchmentIds);

    List<User> findByCatchmentAndIsVoidedFalse(Catchment catchment);
}
