package org.openchs.excel.metadata;

import org.junit.Test;
import org.openchs.excel.reader.ImportMetaDataExcelReader;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static org.junit.Assert.assertEquals;

public class ImportMetaDataTest {
    @Test
    public void readMetaData() throws IOException {
        ImportMetaData importMetaData = ImportMetaDataExcelReader.readMetaData(new ClassPathResource("Import MetaData.xlsx").getInputStream());
        ImportSheetMetaDataList importSheets = importMetaData.getImportSheets();
        ImportSheetMetaData importSheetMetaData = importSheets.get(0);

        assertEquals(9, importMetaData.getNonCalculatedFields().getFieldsFor(importSheetMetaData).size());
        assertEquals(3, importMetaData.getCalculatedFields().getFieldsFor(importSheetMetaData).size());
        assertEquals(2, importSheetMetaData.getDefaultFields().size());
        assertEquals(14, importMetaData.getAllFields(importSheetMetaData).size());
    }

    @Test
    public void getRequestFromImportSheet() throws IOException {
        ImportMetaData importMetaData = ImportMetaDataExcelReader.readMetaData(new ClassPathResource("Import MetaData.xlsx").getInputStream());
    }

    @Test
    public void regex() {
        System.out.println(find("Twinkalben Vikrambhai vsava  - 7", "[a-zA-Z]+\\s+[a-zA-Z]+"));
        System.out.println(find("Twinkalben Vikrambhai vsava  - 7", "[a-zA-Z]+\\s+[a-zA-Z]+\\s+([a-zA-Z]+).*"));
        System.out.println(find("Twinkalben Vikrambhai vsava  - 7", "[a-zA-Z]+\\s+([a-zA-Z]+).*"));
        System.out.println(find("Twinkalben Vikrambhai vsava  - 7", ".*(\\d).*"));
        System.out.println(find("Twinkalben Vikrambhai vsava  -7", ".*(\\d).*"));
        System.out.println(find("Twinkalben Vikrambhai vsava", ".*(\\d).*"));
    }

    private String find(String string, String regex) {
        try {
            Pattern fullNamePattern = Pattern.compile(regex);
            Matcher matcher = fullNamePattern.matcher(string);
            matcher.find();
            return matcher.group(matcher.groupCount());
        } catch (Exception e) {
            return null;
        }
    }
}