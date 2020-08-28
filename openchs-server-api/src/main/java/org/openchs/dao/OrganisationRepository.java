package org.openchs.dao;

import org.openchs.application.projections.ReportingViewProjection;
import org.openchs.domain.Organisation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.data.rest.core.annotation.RestResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
@RepositoryRestResource(collectionResourceRel = "organisation", path = "organisation")
@PreAuthorize("hasAnyAuthority('user','admin','organisation_admin')")
public interface OrganisationRepository extends CrudRepository<Organisation, Long>, JpaSpecificationExecutor<Organisation> {
    Organisation findByName(String name);

    Organisation findByUuid(String organisationUuid);

    @PreAuthorize("hasAnyAuthority('admin')")
    <S extends Organisation> S save(S entity);

    @PreAuthorize("hasAnyAuthority('admin')")
    @Procedure(value = "create_db_user")
    void createDBUser(String name, String pass);

    default Organisation findOne(Long organisationId) {
        return findById(organisationId).orElse(null);
    }

    List<Organisation> findAllByIsVoidedFalse();

    List<Organisation> findByAccount_AccountAdmin_User_Id(Long userId);

    Organisation findByIdAndAccount_AccountAdmin_User_Id(Long id, Long userId);

    @PreAuthorize("hasAnyAuthority('admin')")
    @RestResource(path = "findAllById", rel = "findAllById")
    Page<Organisation> findAllByIdInAndIsVoidedFalse(List<Long> ids, Pageable pageable);

    @PreAuthorize("hasAnyAuthority('admin', 'organisation_admin')")
    @Procedure(value = "create_view")
    void createView(String viewName, String sqlQuery);

    @PreAuthorize("hasAnyAuthority('admin', 'organisation_admin')")
    @Query(value = "select viewname, definition from pg_views where viewowner = :dbUser", nativeQuery = true)
    List<ReportingViewProjection> getAllViewsWithDdlOwnedBy(String dbUser);

    @PreAuthorize("hasAnyAuthority('admin', 'organisation_admin')")
    @Procedure(value = "drop_view")
    void dropView(String viewName);

}
