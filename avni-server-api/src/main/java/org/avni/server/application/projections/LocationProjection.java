package org.avni.server.application.projections;

public interface LocationProjection extends BaseProjection {
    String getTitle();
    Long getTypeId();
    Long getParentId();
    String getLineage();
    String getTitleLineage();
    String getTypeString();
    Double getLevel();
}
