package org.avni.server.dao;

import org.avni.server.application.projections.ReportingViewProjection;
import org.avni.server.domain.Organisation;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ImplementationRepository extends CrudRepository<Organisation, Long> {
    @Procedure(value = "create_view")
    void createView(String schemaName, String viewName, String sqlQuery);

    @Query(value = "select viewname, definition from pg_views where schemaname = :schemaName", nativeQuery = true)
    List<ReportingViewProjection> getAllViewsInSchema(String schemaName);

    @Procedure(value = "drop_view")
    void dropView(String viewName, String schemaName);

    @Procedure(value = "create_db_user")
    void createDBUser(String name, String pass);

    @Procedure(value = "create_implementation_schema")
    void createImplementationSchema(String schemaName, String dbUser);

    /**
     * This is kept here because OrganisationRepository has uer role level @PreAuthorize,
     * and findByName is required by customPrint API where org name is passed by the cookie
     */
    Organisation findByName(String name);
}
