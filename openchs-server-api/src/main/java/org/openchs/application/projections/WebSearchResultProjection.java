package org.openchs.application.projections;

public interface WebSearchResultProjection {
    String getFirstname();

    String getLastname();

    String getFullname();

    String getId();

    String getUuid();

    String getTitle_lineage();

    String getSubject_type_name();

    String getGender_name();

    String getDate_of_birth();

    String getEnrolments();

    String getTotal_elements();
}
