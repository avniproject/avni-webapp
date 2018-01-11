package org.openchs.importer;

import org.openchs.excel.metadata.ImportMetaData;

import java.io.InputStream;

public interface Importer {
    Boolean importData(InputStream inputStream, ImportMetaData importMetaData) throws Exception;
}
