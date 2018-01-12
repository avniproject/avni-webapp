package org.openchs.excel.metadata;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

public class ImportSheetMetaDataList extends ArrayList<ImportSheetMetaData> {
    private Map<Integer, String> systemFields = new HashMap<>();

    public void addSystemField(int position, String systemFieldName) {
        systemFields.put(position, systemFieldName);
    }

    public int getNumberOfSystemFields() {
        return systemFields.size();
    }

    public void addDefaultValue(int position, String defaultValue, ImportSheetMetaData importSheetMetaData) {
        String systemFieldName = systemFields.get(position);
        importSheetMetaData.addDefaultValue(systemFieldName, defaultValue);
    }
}