package org.avni.domain.metadata;

public interface MetaData {
    void accept(MetaDataVisitor metaDataVisitor);
}
