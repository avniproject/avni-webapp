package org.avni.server.excel.metadata;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class ImportMetaData {
    private ImportNonCalculatedFields nonCalculatedFields;
    private ImportCalculatedFields calculatedFields;
    private ImportSheetMetaDataList sheets;
    private ImportAnswerMetaDataList answerMetaDataList;

    public ImportNonCalculatedFields getNonCalculatedFields() {
        return nonCalculatedFields;
    }

    public void setNonCalculatedFields(ImportNonCalculatedFields nonCalculatedFields) {
        this.nonCalculatedFields = nonCalculatedFields;
    }

    public ImportCalculatedFields getCalculatedFields() {
        return calculatedFields;
    }

    public void setCalculatedFields(ImportCalculatedFields calculatedFields) {
        this.calculatedFields = calculatedFields;
    }

    public ImportSheetMetaDataList getImportSheets() {
        List<ImportSheetMetaData> nonNullSheets = sheets.stream()
                .filter(sheet -> !sheet.isNull())
                .collect(Collectors.toList());
        this.sheets.clear();
        this.sheets.addAll(nonNullSheets);
        return this.sheets;
    }

    public void setImportSheets(ImportSheetMetaDataList importSheets) {
        this.sheets = importSheets;
    }

    public ImportSheetMetaDataList getSheets() {
        return sheets;
    }

    public void setSheets(ImportSheetMetaDataList sheets) {
        this.sheets = sheets;
    }

    public ImportAnswerMetaDataList getAnswerMetaDataList() {
        return answerMetaDataList;
    }

    public void setAnswerMetaDataList(ImportAnswerMetaDataList answerMetaDataList) {
        this.answerMetaDataList = answerMetaDataList;
    }

    public List<ImportField> getAllFields(ImportSheetMetaData importSheetMetaData) {
        ArrayList<ImportField> importFields = new ArrayList<>();
        importFields.addAll(importSheetMetaData.getDefaultFields());
        importFields.addAll(nonCalculatedFields.getFieldsFor(importSheetMetaData));
        importFields.addAll(calculatedFields.getFieldsFor(importSheetMetaData));
        return importFields;
    }

    public List<String> compile() {
        List<String> errors = new ArrayList<>();
        addErrorIfUseFileTypeIsNotSpecified(errors, calculatedFields.getUserFileTypes(), "Calculated");
        addErrorIfUseFileTypeIsNotSpecified(errors, nonCalculatedFields.getUserFileTypes(), "Non Calculated");
        return errors;
    }

    private void addErrorIfUseFileTypeIsNotSpecified(List<String> errors, List<String> userFileTypes, String fieldType) {
        userFileTypes.stream().filter(userFileType -> !sheets.containsUserFileType(userFileType)).forEach(missingUserFileType -> errors.add(String.format("%s field is using user file type: %s, that doesn't exist", fieldType, missingUserFileType)));
    }
}
