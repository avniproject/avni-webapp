package org.openchs.importer;

import java.io.InputStream;

public interface Importer {
    public Boolean importData(InputStream inputStream) throws Exception;
}
