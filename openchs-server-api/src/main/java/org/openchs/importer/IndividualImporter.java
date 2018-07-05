package org.openchs.importer;


import org.apache.poi.ss.usermodel.Row;
import org.joda.time.LocalDate;
import org.openchs.dao.ConceptRepository;
import org.openchs.dao.application.FormElementRepository;
import org.openchs.excel.ImportSheetHeader;
import org.openchs.excel.TextToType;
import org.openchs.excel.metadata.ImportAnswerMetaDataList;
import org.openchs.excel.metadata.ImportField;
import org.openchs.excel.metadata.ImportSheetMetaData;
import org.openchs.web.IndividualController;
import org.openchs.web.request.IndividualRequest;
import org.openchs.web.request.PeriodRequest;
import org.openchs.web.validation.ValidationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;


@Component
public class IndividualImporter extends Importer<IndividualRequest> {
    private IndividualController individualController;

    @Autowired
    public IndividualImporter(ConceptRepository conceptRepository, FormElementRepository formElementRepository, IndividualController individualController) {
        super(conceptRepository, formElementRepository);
        this.individualController = individualController;
    }

    @Override
    protected Boolean processRequest(IndividualRequest entityRequest) {
        individualController.save(entityRequest);
        return true;
    }

    @Override
    protected IndividualRequest makeRequest(List<ImportField> importFields, ImportSheetHeader header, ImportSheetMetaData importSheetMetaData, Row row, ImportAnswerMetaDataList answerMetaDataList) {
        IndividualRequest individualRequest = new IndividualRequest();
        individualRequest.setObservations(new ArrayList<>());
        importFields.forEach(importField -> {
            String systemFieldName = importField.getSystemFieldName();
            switch (systemFieldName) {
                case "First Name":
                    individualRequest.setFirstName(importField.getTextValue(row, header, importSheetMetaData));
                    break;
                case "Last Name":
                    String lastName = importField.getTextValue(row, header, importSheetMetaData);
                    individualRequest.setLastName(StringUtils.isEmpty(lastName) ? "." : lastName);
                    break;
                case "Age":
                    String ageInYearsOrMonths = importField.getTextValue(row, header, importSheetMetaData);
                    if (ageInYearsOrMonths != null) {
                        try {
                            individualRequest.setAge(PeriodRequest.fromString(ageInYearsOrMonths));
                        } catch (ValidationException ve) {
                            logger.error(ve.getMessage());
                        }
                    }
                    break;
                case "Date of Birth":
                    Date dateValue = importField.getDateValue(row, header, importSheetMetaData);
                    if (dateValue != null)
                        individualRequest.setDateOfBirth(new LocalDate(dateValue));
                    break;
                case "Date of Birth Verified":
                    individualRequest.setDateOfBirthVerified(importField.getBooleanValue(row, header, importSheetMetaData));
                    break;
                case "Gender":
                    individualRequest.setGender(TextToType.toGender(importField.getTextValue(row, header, importSheetMetaData)));
                    break;
                case "Registration Date":
                    individualRequest.setRegistrationDate(new LocalDate(importField.getDateValue(row, header, importSheetMetaData)));
                    break;
                case "Address":
                    individualRequest.setAddressLevel(importField.getTextValue(row, header, importSheetMetaData));
                    break;
                case "Individual UUID":
                    individualRequest.setUuid(importField.getTextValue(row, header, importSheetMetaData));
                    break;
                case "Catchment UUID":
                    individualRequest.setCatchmentUUID(importField.getTextValue(row, header, importSheetMetaData));
                    break;
                default:
                    individualRequest.addObservation(createObservationRequest(row, header, importSheetMetaData, importField, systemFieldName, answerMetaDataList));
                    break;
            }
        });
        individualRequest.setupUuidIfNeeded();
        return individualRequest;
    }
}
