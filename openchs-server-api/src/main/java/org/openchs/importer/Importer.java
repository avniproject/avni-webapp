package org.openchs.importer;

import org.openchs.excel.MetaDataMapping;

import java.io.InputStream;

public interface Importer {
    public Boolean importData(InputStream inputStream, MetaDataMapping metaDataMapping) throws Exception;
    public MetaDataMapping importMetaData(InputStream inputStream) throws Exception;
}
