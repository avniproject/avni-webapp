package org.openchs.importer;

import org.apache.poi.ss.usermodel.Row;
import org.openchs.dao.ConceptRepository;
import org.openchs.dao.application.FormElementRepository;
import org.openchs.domain.Concept;
import org.openchs.domain.ConceptDataType;
import org.openchs.domain.UserContext;
import org.openchs.excel.DataImportResult;
import org.openchs.excel.ExcelUtil;
import org.openchs.excel.ImportSheetHeader;
import org.openchs.excel.data.ImportFile;
import org.openchs.excel.data.ImportSheet;
import org.openchs.excel.metadata.ImportAnswerMetaDataList;
import org.openchs.excel.metadata.ImportField;
import org.openchs.excel.metadata.ImportMetaData;
import org.openchs.excel.metadata.ImportSheetMetaData;
import org.openchs.framework.security.UserContextHolder;
import org.openchs.web.request.CHSRequest;
import org.openchs.web.request.ObservationRequest;
import org.openchs.web.validation.ValidationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

public abstract class Importer<T extends CHSRequest> {
    protected static Logger logger = LoggerFactory.getLogger(Importer.class);
    private ConceptRepository conceptRepository;
    private FormElementRepository formElementRepository;

    protected Importer(ConceptRepository conceptRepository, FormElementRepository formElementRepository) {
        this.conceptRepository = conceptRepository;
        this.formElementRepository = formElementRepository;
    }

    protected abstract Boolean processRequest(T entityRequest);

    protected abstract T makeRequest(List<ImportField> allFields, ImportSheetHeader header, ImportSheetMetaData importSheetMetaData, Row row, ImportAnswerMetaDataList answerMetaDataList);

    protected ObservationRequest createObservationRequest(Row row, ImportSheetHeader sheetHeader, ImportSheetMetaData sheetMetaData, ImportField importField, String systemFieldName, ImportAnswerMetaDataList answerMetaDataList) {
        return createObservationRequest(row, sheetHeader, sheetMetaData, importField, systemFieldName, answerMetaDataList, null);
    }

    protected ObservationRequest createObservationRequest(Row row, ImportSheetHeader sheetHeader, ImportSheetMetaData sheetMetaData, ImportField importField, String systemFieldName, ImportAnswerMetaDataList answerMetaDataList, Date referenceDate) {
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
            cellValue = importField.getTextValue(row, sheetHeader, sheetMetaData);
            if (cellValue != null) {
                if (((String) cellValue).matches("\b[0-9]+\b|.*[A-Za-z]+.*"))
                    cellValue = ExcelUtil.getDateFromDuration(cellValue.toString(), referenceDate);
                else
                    cellValue = importField.getDateValue(row, sheetHeader, sheetMetaData);

                SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
                sdf.setTimeZone(TimeZone.getTimeZone("IST"));
                cellValue = sdf.format(cellValue);
            }
        } else {
            cellValue = importField.getBooleanValue(row, sheetHeader, sheetMetaData);
        }
        if (cellValue == null) return null;

        if (ConceptDataType.Coded.toString().equals(concept.getDataType())) {
            Boolean isSingleSelect = formElementRepository.findFirstByConcept(concept).isSingleSelect();
            if (isSingleSelect) {
                String systemAnswer = answerMetaDataList.getSystemAnswer((String) cellValue, concept.getName());
                if (systemAnswer == null) cellValue = null;
                else {
                    cellValue = conceptRepository.findByName(systemAnswer.trim()).getUuid();
                }
            } else {
                List<String> userAnswers = Arrays.asList(((String) cellValue).split(","))
                        .stream()
                        .map((userAnswer) -> {
                            String systemAnswer = answerMetaDataList.getSystemAnswer(userAnswer, concept.getName());
                            Concept answerConcept = conceptRepository.findByName(systemAnswer.trim());
                            if (answerConcept == null)
                                throw new NullPointerException(String.format("Answer concept |%s| not found in concept |%s|", userAnswer, systemFieldName));
                            return answerConcept.getUuid();
                        })
                        .collect(Collectors.toList());
                cellValue = userAnswers;
            }
        }

        if (cellValue == null) return null;
        observationRequest.setValue(cellValue);
        return observationRequest;
    }

    protected void mergeObservations(List<ObservationRequest> observationRequests, ObservationRequest observationRequest) {
        ObservationRequest existingObservationRequest = observationRequests.stream().filter(x -> x.getConceptName().equals(observationRequest.getConceptName())).findAny().orElse(null);
        if (existingObservationRequest == null) observationRequests.add(observationRequest);
        else
            existingObservationRequest.setValue(String.format("%s\n\n%s", existingObservationRequest.getValue(), observationRequest.getValue()));
    }

    public List importSheet(ImportFile importFile, ImportMetaData importMetaData, ImportSheetMetaData importSheetMetaData, DataImportResult dataImportResult, boolean performImport) throws InterruptedException {
        List<String> errors = importMetaData.compile();
        if (errors.size() != 0) {
            errors.forEach(o -> logger.error(o));
//            throw new ValidationException("Metadata file has errors");
        }
        List<ImportField> allFields = importMetaData.getAllFields(importSheetMetaData);
        logger.info(String.format("Reading Sheet: %s", importSheetMetaData.getSheetName()));
        ImportSheet importSheet = importFile.getSheet(importSheetMetaData.getSheetName());
        ImportSheetHeader header = importSheet.getHeader();
        UserContext userContext = UserContextHolder.getUserContext();
        SecurityContext context = SecurityContextHolder.getContext();
        int numberOfDataRows = importSheet.getNumberOfDataRows();
        List list = Collections.synchronizedList(new ArrayList<>());
        IntStream intStream = IntStream.range(0, numberOfDataRows);
        IntStream stream = performImport ? intStream.parallel() : intStream;
        stream.mapToObj(importSheet::getDataRow)
                .filter(Objects::nonNull)
                .forEach((row) -> {
                    SecurityContextHolder.setContext(context);
                    UserContextHolder.create(userContext);
                    T entityRequest = (T) new CHSRequest();
                    try {
                        logger.info(String.format("Creating Request for %s", importSheetMetaData.getEntityType()));
                        entityRequest = makeRequest(allFields, header, importSheetMetaData, row, importMetaData.getAnswerMetaDataList());
                        if (!performImport)
                            list.add(entityRequest);
                        if (performImport) {
                            logger.info(String.format("Saving/Updating %s with UUID %s", importSheetMetaData.getEntityType(), entityRequest.getUuid()));
                            processRequest(entityRequest);
                            logger.info(String.format("Saved/Updated %s with UUID %s", importSheetMetaData.getEntityType(), entityRequest.getUuid()));
                        }
                    } catch (Exception e) {
                        logger.error(String.format("Failed %s with UUID %s with error %s", importSheetMetaData.getEntityType(), entityRequest.getUuid(), e.getMessage()));
                        dataImportResult.exceptionHappened(importSheetMetaData.asMap(), e);
                    }

                });
        logger.info(String.format("Imported Sheet: %s", importSheetMetaData.getSheetName()));
        return list;
    }

    public List createRequests(ImportFile importFile, ImportMetaData importMetaData, ImportSheetMetaData importSheetMetaData, DataImportResult dataImportResult) throws InterruptedException {
        return importSheet(importFile, importMetaData, importSheetMetaData, dataImportResult, false);
    }
}