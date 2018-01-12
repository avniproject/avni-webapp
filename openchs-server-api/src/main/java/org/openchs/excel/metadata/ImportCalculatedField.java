package org.openchs.excel.metadata;

import org.apache.poi.ss.usermodel.Row;
import org.joda.time.LocalDate;
import org.openchs.excel.ExcelUtil;
import org.openchs.excel.ImportSheetHeader;
import org.openchs.util.Mappings;
import sun.reflect.generics.reflectiveObjects.NotImplementedException;

import java.util.Date;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class ImportCalculatedField implements ImportField {
    private String userFileType;
    private String systemField;
    private String sourceUserField;
    private Class entityType;
    private Pattern pattern;

    public String getSystemField() {
        return systemField;
    }

    public void setSystemField(String systemField) {
        this.systemField = systemField;
    }

    public String getSourceUserField() {
        return sourceUserField;
    }

    public void setSourceUserField(String sourceUserField) {
        this.sourceUserField = sourceUserField;
    }

    public void setRegex(String regex) {
        pattern = Pattern.compile(regex);
    }

    public String getUserFileType() {
        return userFileType;
    }

    public void setUserFileType(String userFileType) {
        this.userFileType = userFileType;
    }

    public void setEntityType(String entityType) {
        this.entityType = Mappings.ENTITY_TYPES.get(entityType);
    }

    public Class getEntityType() {
        return entityType;
    }

    @Override
    public String getSystemFieldName() {
        return systemField;
    }

    private String find(String string) {
        try {
            Matcher matcher = pattern.matcher(string);
            matcher.find();
            return matcher.group(matcher.groupCount());
        } catch (Exception e) {
            return null;
        }
    }

    @Override
    public String getTextValue(Row row, ImportSheetHeader importSheetHeader, ImportSheetMetaData importSheetMetaData) {
        int position = importSheetHeader.getPosition(sourceUserField);
        String text = ExcelUtil.getText(row, position);
        return find(text);
    }

    @Override
    public Date getDateValue(Row row, ImportSheetHeader importSheetHeader, ImportSheetMetaData importSheetMetaData) {
        throw new NotImplementedException();
    }

    @Override
    public Boolean getBooleanValue(Row row, ImportSheetHeader importSheetHeader, ImportSheetMetaData importSheetMetaData) {
        throw new NotImplementedException();
    }
}