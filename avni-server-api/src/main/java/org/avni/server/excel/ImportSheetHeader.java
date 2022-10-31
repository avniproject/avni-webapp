package org.avni.server.excel;

import org.apache.poi.ss.usermodel.Row;
import org.springframework.util.StringUtils;

import java.util.HashMap;
import java.util.Map;

public class ImportSheetHeader {
    private Map<String, Integer> map = new HashMap<>();

    public ImportSheetHeader(Row row) {
        for (int i = 0; i < row.getLastCellNum(); i++) {
            String text = ExcelUtil.getText(row, i);
            if (StringUtils.isEmpty(text)) break;

            map.put(text, i);
        }
    }

    public int getPosition(String userFieldName) {
        Integer integer = map.get(userFieldName);
        return integer == null ? -1 : integer;
    }
}
