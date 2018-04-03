package org.openchs.excel.data;

import org.apache.logging.log4j.util.Strings;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFRow;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.joda.time.DateTime;
import org.joda.time.LocalDate;
import org.openchs.dao.ConceptRepository;
import org.openchs.dao.application.FormElementRepository;
import org.openchs.domain.*;
import org.openchs.excel.ExcelUtil;
import org.openchs.excel.ImportSheetHeader;
import org.openchs.excel.TextToType;
import org.openchs.excel.metadata.ImportAnswerMetaDataList;
import org.openchs.excel.metadata.ImportField;
import org.openchs.excel.metadata.ImportSheetMetaData;
import org.openchs.web.request.*;
import org.openchs.web.validation.ValidationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public class ImportSheet {
    private final Logger logger;
    private final ImportSheetHeader importSheetHeader;
    private XSSFSheet xssfSheet;

    public ImportSheet(XSSFSheet xssfSheet) {
        this.xssfSheet = xssfSheet;
        logger = LoggerFactory.getLogger(this.getClass());
        XSSFRow row = xssfSheet.getRow(0);
        importSheetHeader = new ImportSheetHeader(row);
    }

    public int getNumberOfDataRows() {
        return xssfSheet.getPhysicalNumberOfRows() - 1;
    }

    private XSSFRow getDataRow(int rowIndex) {
        XSSFRow row = xssfSheet.getRow(rowIndex + 1);
        if (row == null) return null;
        String rawCellValue = ExcelUtil.getRawCellValue(row, 0);
        return Strings.isBlank(rawCellValue) ? null : row;
    }

    private ObservationRequest createObservationRequest(Row row, ImportSheetHeader sheetHeader, ImportSheetMetaData sheetMetaData, ImportField importField, String systemFieldName, ConceptRepository conceptRepository, FormElementRepository formElementRepository, ImportAnswerMetaDataList answerMetaDataList) {
        ObservationRequest observationRequest = new ObservationRequest();
        observationRequest.setConceptName(systemFieldName);
        Concept concept = conceptRepository.findByName(systemFieldName);
        if (concept == null)
            throw new NullPointerException(String.format("Concept with name |%s| not found", systemFieldName));

        Object cellValue;
        if (ConceptDataType.stringType(concept.getDataType())) {
            cellValue = importField.getTextValue(row, sheetHeader, sheetMetaData);
        } else if (ConceptDataType.Numeric.toString().equals(concept.getDataType())) {
            cellValue = importField.getDoubleValue(row, sheetHeader, sheetMetaData);
        } else if (ConceptDataType.Date.toString().equals(concept.getDataType())) {
            cellValue = importField.getDateValue(row, sheetHeader, sheetMetaData);
        } else {
            cellValue = importField.getBooleanValue(row, sheetHeader, sheetMetaData);
        }
        if (cellValue == null) return null;

        if (ConceptDataType.Coded.toString().equals(concept.getDataType())) {
            /*
            Horrible hack. We are trying to guess the form the concept belongs to, and thus find out if
            it should be single select or not. This will fail if the same question is asked as both single and
            multi select in two different forms.
            */

            Boolean isSingleSelect = formElementRepository.findFirstByConcept(concept).isSingleSelect();
            String systemAnswer = answerMetaDataList.getSystemAnswer((String) cellValue, concept.getName());
            if (isSingleSelect) {
                //Concept answerConcept = conceptRepository.findByName(systemAnswer.trim());
                cellValue = conceptRepository.findByName(systemAnswer.trim()).getUuid();
            } else {
                List<String> concepts = Arrays.asList(systemAnswer.split(",")).stream().map(
                        (answer) -> {
                            Concept answerConcept = conceptRepository.findByName(answer.trim());
                            if (answerConcept == null) throw new NullPointerException(String.format("Answer concept |%s| not found in concept |%s|", answer, systemFieldName));
                            return answerConcept.getUuid();
                        }).collect(Collectors.toList());
                cellValue = concepts;
            }
        }

        if (cellValue == null) return null;
        observationRequest.setValue(cellValue);
        return observationRequest;
    }

    private IndividualRequest getIndividualRequest(List<ImportField> importFields, XSSFRow row, ImportSheetMetaData importSheetMetaData, ConceptRepository conceptRepository, FormElementRepository formElementRepository, ImportAnswerMetaDataList answerMetaDataList) {
        IndividualRequest individualRequest = new IndividualRequest();
        individualRequest.setObservations(new ArrayList<>());
        importFields.forEach(importField -> {
            String systemFieldName = importField.getSystemFieldName();
            switch (systemFieldName) {
                case "First Name":
                    individualRequest.setFirstName(importField.getTextValue(row, importSheetHeader, importSheetMetaData));
                    break;
                case "Last Name":
                    individualRequest.setLastName(importField.getTextValue(row, importSheetHeader, importSheetMetaData));
                    break;
                case "Age":
                    String ageInYearsOrMonths = importField.getTextValue(row, importSheetHeader, importSheetMetaData);
                    try {
                        individualRequest.setAge(PeriodRequest.fromString(ageInYearsOrMonths));
                    } catch (ValidationException ve) {
                        logger.error(ve.getMessage());
                    } finally {
                        break;
                    }
                case "Date of Birth":
                    individualRequest.setDateOfBirth(new LocalDate(importField.getDateValue(row, importSheetHeader, importSheetMetaData)));
                    break;
                case "Date of Birth Verified":
                    individualRequest.setDateOfBirthVerified(importField.getBooleanValue(row, importSheetHeader, importSheetMetaData));
                    break;
                case "Gender":
                    individualRequest.setGender(TextToType.toGender(importField.getTextValue(row, importSheetHeader, importSheetMetaData)));
                    break;
                case "Registration Date":
                    individualRequest.setRegistrationDate(new LocalDate(importField.getDateValue(row, importSheetHeader, importSheetMetaData)));
                    break;
                case "Address":
                    individualRequest.setAddressLevel(importField.getTextValue(row, importSheetHeader, importSheetMetaData));
                    break;
                case "Individual UUID":
                    individualRequest.setUuid(importField.getTextValue(row, importSheetHeader, importSheetMetaData));
                    break;
                default:
                    individualRequest.addObservation(createObservationRequest(row, importSheetHeader, importSheetMetaData, importField, systemFieldName, conceptRepository, formElementRepository, answerMetaDataList));
                    break;
            }
        });
        individualRequest.setupUuidIfNeeded();
        return individualRequest;
    }

    private ProgramEnrolmentRequest getEnrolmentRequest(List<ImportField> importFields, XSSFRow row, ImportSheetMetaData sheetMetaData, ConceptRepository conceptRepository, FormElementRepository formElementRepository, ImportAnswerMetaDataList answerMetaDataList) {
        ProgramEnrolmentRequest programEnrolmentRequest = new ProgramEnrolmentRequest();
        programEnrolmentRequest.setProgram(sheetMetaData.getProgramName());
        programEnrolmentRequest.setObservations(new ArrayList<>());
        programEnrolmentRequest.setProgramExitObservations(new ArrayList<>());
        importFields.forEach(importField -> {
            String systemFieldName = importField.getSystemFieldName();
            switch (systemFieldName) {
                case "Enrolment UUID":
                    programEnrolmentRequest.setUuid(importField.getTextValue(row, importSheetHeader, sheetMetaData));
                    break;
                case "Individual UUID":
                    programEnrolmentRequest.setIndividualUUID(importField.getTextValue(row, importSheetHeader, sheetMetaData));
                    break;
                case "Enrolment Date":
                    programEnrolmentRequest.setEnrolmentDateTime(new DateTime(importField.getDateValue(row, importSheetHeader, sheetMetaData)));
                    break;
                case "Address":
                    break;
                default:
                    programEnrolmentRequest.addObservation(createObservationRequest(row, importSheetHeader, sheetMetaData, importField, systemFieldName, conceptRepository, formElementRepository, answerMetaDataList));
                    break;
            }
        });
        programEnrolmentRequest.setupUuidIfNeeded();
        return programEnrolmentRequest;
    }

    private ProgramEncounterRequest getProgramEncounterRequest(List<ImportField> importFields, XSSFRow row, ImportSheetMetaData sheetMetaData, ConceptRepository conceptRepository, FormElementRepository formElementRepository, ImportAnswerMetaDataList answerMetaDataList) {
        ProgramEncounterRequest programEncounterRequest = new ProgramEncounterRequest();
        programEncounterRequest.setObservations(new ArrayList<>());
        importFields.forEach(importField -> {
            String systemFieldName = importField.getSystemFieldName();
            switch (systemFieldName) {
                case "Enrolment UUID":
                    programEncounterRequest.setProgramEnrolmentUUID(importField.getTextValue(row, importSheetHeader, sheetMetaData));
                    break;
                case "UUID":
                    programEncounterRequest.setUuid(importField.getTextValue(row, importSheetHeader, sheetMetaData));
                    break;
                case "Visit Type":
                    programEncounterRequest.setEncounterType(importField.getTextValue(row, importSheetHeader, sheetMetaData));
                    break;
                case "Visit Name":
                    programEncounterRequest.setName(importField.getTextValue(row, importSheetHeader, sheetMetaData));
                    break;
                case "Earliest Date":
                    programEncounterRequest.setEarliestVisitDateTime(new DateTime(importField.getDateValue(row, importSheetHeader, sheetMetaData)));
                    break;
                case "Actual Date":
                    programEncounterRequest.setEncounterDateTime(new DateTime(importField.getDateValue(row, importSheetHeader, sheetMetaData)));
                    break;
                case "Max Date":
                    programEncounterRequest.setMaxDateTime(new DateTime(importField.getDateValue(row, importSheetHeader, sheetMetaData)));
                    break;
                case "Address":
                    break;
                default:
                    programEncounterRequest.addObservation(createObservationRequest(row, importSheetHeader, sheetMetaData, importField, systemFieldName, conceptRepository, formElementRepository, answerMetaDataList));
                    break;
            }
        });
        programEncounterRequest.setEncounterType(sheetMetaData.getEncounterType());
        return programEncounterRequest;
    }

    private EncounterRequest getEncounterRequest(List<ImportField> importFields, XSSFRow row, ImportSheetMetaData sheetMetaData, ConceptRepository conceptRepository, FormElementRepository formElementRepository, ImportAnswerMetaDataList answerMetaDataList) {
        EncounterRequest encounterRequest = new EncounterRequest();
        encounterRequest.setObservations(new ArrayList<>());
        importFields.forEach(importField -> {
            String systemFieldName = importField.getSystemFieldName();
            switch (systemFieldName) {
                case "Individual UUID":
                    encounterRequest.setIndividualUUID(importField.getTextValue(row, importSheetHeader, sheetMetaData));
                    break;
                case "Visit Type":
                    encounterRequest.setEncounterType(importField.getTextValue(row, importSheetHeader, sheetMetaData));
                    break;
                case "Encounter DateTime":
                    encounterRequest.setEncounterDateTime(new DateTime(importField.getDateValue(row, importSheetHeader, sheetMetaData)));
                    break;
                default:
                    ObservationRequest observationRequest = createObservationRequest(row, importSheetHeader, sheetMetaData, importField, systemFieldName, conceptRepository, formElementRepository, answerMetaDataList);
                    if (observationRequest == null) break;
                    List<ObservationRequest> observations = encounterRequest.getObservations();
                    this.mergeObservations(observations, observationRequest);
                    encounterRequest.setObservations(observations);
                    break;
            }
        });
        encounterRequest.setEncounterType(sheetMetaData.getEncounterType());
        return encounterRequest;
    }

    private void mergeObservations(List<ObservationRequest> observationRequests, ObservationRequest observationRequest) {
        ObservationRequest existingObservationRequest = observationRequests.stream().filter(x -> x.getConceptName().equals(observationRequest.getConceptName())).findAny().orElse(null);
        if (existingObservationRequest == null) observationRequests.add(observationRequest);
        else existingObservationRequest.setValue(String.format("%s\n\n%s", existingObservationRequest.getValue(), observationRequest.getValue()));
    }

    private boolean isSheetOfType(ImportSheetMetaData importSheetMetaData, Class aClass) {
        return importSheetMetaData.getEntityType().equals(aClass);
    }

    public CHSRequest getRequest(List<ImportField> importFields, ImportSheetMetaData sheetMetaData, int dataRowNumber, ConceptRepository conceptRepository, FormElementRepository formElementRepository, ImportAnswerMetaDataList answerMetaDataList) {
        XSSFRow row = getDataRow(dataRowNumber);
        if (row == null) return null;

        if (isSheetOfType(sheetMetaData, Individual.class))
            return getIndividualRequest(importFields, row, sheetMetaData, conceptRepository, formElementRepository, answerMetaDataList);
        else if (isSheetOfType(sheetMetaData, ProgramEnrolment.class))
            return getEnrolmentRequest(importFields, row, sheetMetaData, conceptRepository, formElementRepository, answerMetaDataList);
        else if (isSheetOfType(sheetMetaData, ProgramEncounter.class))
            return getProgramEncounterRequest(importFields, row, sheetMetaData, conceptRepository, formElementRepository, answerMetaDataList);
        else if (isSheetOfType(sheetMetaData, Encounter.class))
            return getEncounterRequest(importFields, row, sheetMetaData, conceptRepository, formElementRepository, answerMetaDataList);

        throw new RuntimeException(String.format("Unknown data type in the sheet: \"%s\"", sheetMetaData.getEntityType().getName()));
    }
}