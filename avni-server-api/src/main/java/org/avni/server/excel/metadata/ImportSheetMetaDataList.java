package org.avni.server.excel.metadata;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class ImportSheetMetaDataList extends ArrayList<ImportSheetMetaData> {
    private Map<Integer, String> systemFields = new HashMap<>();

    public void addSystemField(int position, String systemFieldName) {
        systemFields.put(position, systemFieldName);
    }

    public int getNumberOfSystemFields() {
        return systemFields.size();
    }

    public void addDefaultValue(int position, Object defaultValue, ImportSheetMetaData importSheetMetaData) {
        String systemFieldName = systemFields.get(position);
        importSheetMetaData.addDefaultValue(systemFieldName, defaultValue);
    }

    public boolean containsUserFileType(String userFileType) {
        return this.stream().anyMatch(importSheetMetaData -> importSheetMetaData.getUserFileType().equals(userFileType));
    }

    public List<String> foo() {
        return this.stream().filter(ImportSheetMetaData::isActive).map(ImportSheetMetaData::getUserFileType).collect(Collectors.toList());
    }
}
