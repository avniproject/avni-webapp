package org.avni.server.importer;


import org.apache.poi.ss.usermodel.Row;
import org.joda.time.LocalDate;
import org.avni.server.dao.ConceptRepository;
import org.avni.server.dao.UserRepository;
import org.avni.server.dao.application.FormElementRepository;
import org.avni.server.excel.ImportSheetHeader;
import org.avni.server.excel.TextToType;
import org.avni.server.excel.metadata.ImportAnswerMetaDataList;
import org.avni.server.excel.metadata.ImportCalculatedFields;
import org.avni.server.excel.metadata.ImportField;
import org.avni.server.excel.metadata.ImportSheetMetaData;
import org.avni.server.web.IndividualController;
import org.avni.server.web.request.IndividualRequest;
import org.avni.server.web.request.PeriodRequest;
import org.avni.server.web.validation.ValidationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;


@Component
public class IndividualImporter extends Importer<IndividualRequest> {
    private IndividualController individualController;
    private static String ALIAS_CONCEPT_NAME_ADDRESS_TITLE = "ADDRESS_LEVEL_TITLE";

    @Autowired
    public IndividualImporter(ConceptRepository conceptRepository, FormElementRepository formElementRepository, IndividualController individualController, UserRepository userRepository) {
        super(conceptRepository, formElementRepository, userRepository);
        this.individualController = individualController;
    }

    @Override
    protected Boolean processRequest(IndividualRequest entityRequest) {
        individualController.save(entityRequest);
        return true;
    }

    @Override
    protected IndividualRequest makeRequest(List<ImportField> importFields, ImportSheetHeader header, ImportSheetMetaData importSheetMetaData, Row row, ImportAnswerMetaDataList answerMetaDataList, ImportCalculatedFields calculatedFields) {
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
                    individualRequest.setLastName(StringUtils.isEmpty(lastName) ? "" : lastName);
                    break;
                case "Profile Picture":
                    //Do nothing, as we do not Want to upload image here due to performance considerations
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
                case "Address Level":
                    String userAddressValue = importField.getTextValue(row, header, importSheetMetaData);
                    individualRequest.setAddressLevel(answerMetaDataList.getSystemAnswer(userAddressValue, ALIAS_CONCEPT_NAME_ADDRESS_TITLE));
                    break;
                case "AddressUUID":
                    String userAddressValueUUID = importField.getTextValue(row, header, importSheetMetaData);
                    individualRequest.setAddressLevelUUID(answerMetaDataList.getSystemAnswer(userAddressValueUUID, ALIAS_CONCEPT_NAME_ADDRESS_TITLE));
                    break;
                case "Individual UUID":
                    individualRequest.setUuid(importField.getTextValue(row, header, importSheetMetaData));
                    break;
                case "Catchment UUID":
                    individualRequest.setCatchmentUUID(importField.getTextValue(row, header, importSheetMetaData));
                    break;
                case "User":
                    setUser(header, importSheetMetaData, row, importField);
                    break;
                case "Voided":
                    individualRequest.setVoided(importField.getBooleanValue(row, header, importSheetMetaData));
                    break;
                case "SubjectTypeUUID":
                    individualRequest.setSubjectTypeUUID(importField.getTextValue(row, header, importSheetMetaData));
                    break;
                default:
                    individualRequest.addObservation(createObservationRequest(row, header, importSheetMetaData, importField, systemFieldName, answerMetaDataList, calculatedFields));
                    break;
            }
        });
        individualRequest.setupUuidIfNeeded();
        return individualRequest;
    }
}
