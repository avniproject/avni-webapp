package org.openchs.excel.metadata;

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

    public void addUserField(int position, String userFieldName, ImportNonCalculatedField nonCalculatedField) {
        String userFileType = positionFileTypeMap.get(position);
        nonCalculatedField.addUserField(userFieldName, userFileType);
    }

    public List<ImportField> getFieldsFor(ImportSheetMetaData sheetMetaData) {
        return this.stream().filter(field -> {
            String userField = field.getUserField(sheetMetaData.getUserFileType());
            return field.getFormType().equals(sheetMetaData.getFormType()) && userField != null;
        }).collect(Collectors.toList());
    }

    public int getNumberOfFileTypes() {
        return positionFileTypeMap.size();
    }

    public List<String> getUserFileTypes() {
        return this.stream().map(ImportNonCalculatedField::getImportUserFileType).distinct().collect(Collectors.toList());
    }
}