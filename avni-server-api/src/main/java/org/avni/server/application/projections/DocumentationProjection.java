package org.avni.server.application.projections;

public interface DocumentationProjection extends BaseProjection {

    String getName();
    DocumentationProjection getParent();
}
