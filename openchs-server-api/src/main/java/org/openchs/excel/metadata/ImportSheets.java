package org.openchs.excel.metadata;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

public class ImportSheets extends ArrayList<ImportSheet> {
    private Map<Integer, String> systemFields = new HashMap<>();

    public void addSystemField(int position, String systemFieldName) {
        systemFields.put(position, systemFieldName);
    }
}