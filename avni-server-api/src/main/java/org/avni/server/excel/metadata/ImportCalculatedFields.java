package org.avni.server.excel.metadata;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class ImportCalculatedFields extends ArrayList<ImportCalculatedField> {
    public List<ImportField> getFieldsFor(ImportSheetMetaData metaDataSheet) {
        return this.stream().filter(field -> metaDataSheet.getUserFileType().equals(field.getUserFileType()) && metaDataSheet.getEntityType().equals(field.getEntityType())).collect(Collectors.toList());
    }

    public List<String> getUserFileTypes() {
        return this.stream().map(ImportCalculatedField::getUserFileType).distinct().collect(Collectors.toList());
    }
}
