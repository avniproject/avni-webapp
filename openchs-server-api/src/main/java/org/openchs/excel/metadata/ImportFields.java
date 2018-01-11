package org.openchs.excel.metadata;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

public class ImportFields extends ArrayList<ImportField> {
    private Map<Integer, String> userFileTypes = new HashMap<>();

    public void addFileType(int position, String userFileType) {
        userFileTypes.put(position, userFileType);
    }
}