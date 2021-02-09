package org.openchs.domain.metadata;

public interface MetaData {
    void accept(MetaDataVisitor metaDataVisitor);
}