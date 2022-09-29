package org.avni.server.domain.metadata;

public interface MetaData {
    void accept(MetaDataVisitor metaDataVisitor);
}
