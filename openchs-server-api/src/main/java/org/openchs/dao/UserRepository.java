package org.openchs.dao;

import org.openchs.domain.User;
import org.openchs.projection.OrgAdminUserProjection;
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


@Repository
@RepositoryRestResource(collectionResourceRel = "user", path = "user")
@PreAuthorize("hasAnyAuthority('admin','organisation_admin')")
public interface UserRepository extends PagingAndSortingRepository<User, Long>, JpaSpecificationExecutor<User> {
    User findByUsername(String username);
    User findByUuid(String uuid);

    default User findOne(Long id) {
        return findById(id).orElse(null);
    }

    @PreAuthorize("hasAnyAuthority('admin','organisation_admin', 'user')")
    User save(User user);

    @RestResource(path = "findByOrganisation", rel = "findByOrganisation")
    Page<User> findByOrganisationIdAndIsVoidedFalse(@Param("organisationId") Long organisationId,
                                                    Pageable pageable);

    Page<User> findByOrganisationIdAndIsVoidedFalseAndUsernameIgnoreCaseContaining(Long organisationId,
                                                               String username,
                                                               Pageable pageable);

    Page<User> findByOrganisationIdAndIsVoidedFalseAndNameIgnoreCaseContaining(Long organisationId,
                                                                               String name,
                                                                               Pageable pageable);

    Page<User> findByOrganisationIdAndIsVoidedFalseAndEmailIgnoreCaseContaining(Long organisationId,
                                                            String email,
                                                            Pageable pageable);

    Page<User> findByOrganisationIdAndIsVoidedFalseAndPhoneNumberContaining(Long organisationId,
                                                                            String phoneNumber,
                                                                            Pageable pageable);

    @Query(value = "SELECT u.id as id, u.name as name, u.username as username, u.email as email, " +
            "u.phoneNumber as phoneNumber, u.organisationId as organisationId, u.disabledInCognito as disabledInCognito " +
            "FROM User u where u.isVoided = false and u.isOrgAdmin = true " +
            "and (:username is null or u.username like %:username%) " +
            "and (:name is null or u.name like %:name%) " +
            "and (:email is null or u.email like %:email%) " +
            "and (:phoneNumber is null or u.phoneNumber like %:phoneNumber%)")
    Page<OrgAdminUserProjection> findOrgAdmins(String username, String name, String email, String phoneNumber, Pageable pageable);

    @Query(value = "SELECT u.id as id, u.name as name, u.username as username, u.email as email, " +
            "u.phoneNumber as phoneNumber, u.organisationId as organisationId, u.disabledInCognito as disabledInCognito " +
            "FROM User u where u.id=:id")
    OrgAdminUserProjection getOne(Long id);
}
