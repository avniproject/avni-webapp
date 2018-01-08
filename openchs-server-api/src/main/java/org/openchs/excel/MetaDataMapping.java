package org.openchs.excel;

import org.openchs.application.FormType;

import java.util.ArrayList;
import java.util.List;

public class MetaDataMapping {
    private List<String> mappingHeader = new ArrayList<>();
    private List<ExcelFieldMetaData> fields = new ArrayList<>();

    public List<String> getMappingHeader() {
        return mappingHeader;
    }

    public void addField(ExcelFieldMetaData fieldMetaData) {
        fields.add(fieldMetaData);
    }

    public String getMappedField(FormType formType, String fieldName, String fileName) {
        ExcelFieldMetaData excelFieldMetaData = fields.stream().filter(fieldMetaData -> formType.equals(fieldMetaData.getType()) && fieldName.equals(fieldMetaData.getFieldNameIn(fileName))).findFirst().orElse(null);
        return excelFieldMetaData == null ? null : excelFieldMetaData.getSystemField();
    }
}