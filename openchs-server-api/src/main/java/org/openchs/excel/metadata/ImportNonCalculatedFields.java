package org.openchs.excel.metadata;

import org.openchs.application.FormType;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class ImportNonCalculatedFields extends ArrayList<ImportNonCalculatedField> {
    private Map<Integer, String> positionFileTypeMap = new HashMap<>();

    public void addFileType(int index, String userFileType) {
        positionFileTypeMap.put(index, userFileType);
    }

    public ImportNonCalculatedField getField(FormType formType, String userField, String fileName) {
        return this.stream().filter(importNonCalculatedField -> importNonCalculatedField.getSystemFieldName().equals(userField)).findFirst().orElse(null);
    }

    public void addUserField(int position, String userFieldName, ImportNonCalculatedField nonCalculatedField) {
        String userFileType = positionFileTypeMap.get(position);
        nonCalculatedField.addUserField(userFieldName, userFileType);
    }

    public List<ImportField> getFieldsFor(ImportSheetMetaData metaDataSheet) {
        return this.stream().filter(field -> {
            String userField = field.getUserField(metaDataSheet.getUserFileType());
            return field.getFormType().equals(metaDataSheet.getFormType()) && userField != null;
        }).collect(Collectors.toList());
    }

    public int getNumberOfFileTypes() {
        return positionFileTypeMap.size();
    }
}