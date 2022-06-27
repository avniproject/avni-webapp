package org.avni.application.projections;

public interface DocumentationProjection extends BaseProjection {

    String getName();
    DocumentationProjection getParent();
}
