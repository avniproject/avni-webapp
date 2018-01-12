package org.openchs.excel.metadata;

import org.openchs.application.FormType;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class ImportCalculatedFields extends ArrayList<ImportCalculatedField> {
    public ImportCalculatedField getField(FormType formType, String userFieldName, String fileName) {
        return this.stream().filter(field -> field.getSystemField().equals(userFieldName)).findFirst().orElse(null);
    }

    public List<ImportField> getFieldsFor(ImportSheetMetaData metaDataSheet) {
        return this.stream().filter(field -> metaDataSheet.getUserFileType().equals(field.getUserFileType())).collect(Collectors.toList());
    }
}