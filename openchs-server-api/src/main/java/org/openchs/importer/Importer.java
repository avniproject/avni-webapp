package org.openchs.importer;

import org.apache.poi.ss.usermodel.Row;
import org.openchs.dao.ConceptRepository;
import org.openchs.dao.application.FormElementRepository;
import org.openchs.domain.Concept;
import org.openchs.domain.ConceptDataType;
import org.openchs.domain.UserContext;
import org.openchs.excel.DataImportResult;
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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

public abstract class Importer<T extends CHSRequest> {
    protected static Logger logger = LoggerFactory.getLogger(Importer.class);

    @Autowired
    private ConceptRepository conceptRepository;
    @Autowired
    private FormElementRepository formElementRepository;

    protected abstract Boolean processRequest(T entityRequest);

    protected abstract T makeRequest(List<ImportField> allFields, ImportSheetHeader header, ImportSheetMetaData importSheetMetaData, Row row, ImportAnswerMetaDataList answerMetaDataList);

    protected ObservationRequest createObservationRequest(Row row, ImportSheetHeader sheetHeader, ImportSheetMetaData sheetMetaData, ImportField importField, String systemFieldName, ImportAnswerMetaDataList answerMetaDataList) {
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
            Boolean isSingleSelect = formElementRepository.findFirstByConcept(concept).isSingleSelect();
            String systemAnswer = answerMetaDataList.getSystemAnswer((String) cellValue, concept.getName());
            if (systemAnswer == null) {
                cellValue = null;
            } else if (isSingleSelect) {
                cellValue = conceptRepository.findByName(systemAnswer.trim()).getUuid();
            } else if (!isSingleSelect) {
                List<String> concepts = Arrays.asList(systemAnswer.split(",")).stream().map(
                        (answer) -> {
                            Concept answerConcept = conceptRepository.findByName(answer.trim());
                            if (answerConcept == null)
                                throw new NullPointerException(String.format("Answer concept |%s| not found in concept |%s|", answer, systemFieldName));
                            return answerConcept.getUuid();
                        }).collect(Collectors.toList());
                cellValue = concepts;
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

    public Boolean importSheet(ImportFile importFile, ImportMetaData importMetaData, ImportSheetMetaData importSheetMetaData, DataImportResult dataImportResult) throws InterruptedException {
        List<ImportField> allFields = importMetaData.getAllFields(importSheetMetaData);
        logger.info(String.format("Reading Sheet: %s", importSheetMetaData.getSheetName()));
        ImportSheet importSheet = importFile.getSheet(importSheetMetaData.getSheetName());
        ImportSheetHeader header = importSheet.getHeader();
        UserContext userContext = UserContextHolder.getUserContext();
        SecurityContext context = SecurityContextHolder.getContext();
        int numberOfDataRows = importSheet.getNumberOfDataRows();
        IntStream.range(0, numberOfDataRows)
                .parallel()
                .mapToObj(importSheet::getDataRow)
                .filter(Objects::nonNull)
                .forEach((row) -> {
                    SecurityContextHolder.setContext(context);
                    UserContextHolder.create(userContext);
                    try {
                        logger.info(String.format("Creating Request for %s", importSheetMetaData.getEntityType()));
                        T entityRequest = makeRequest(allFields, header, importSheetMetaData, row, importMetaData.getAnswerMetaDataList());
                        logger.info(String.format("Saving/Updating %s with UUID %s", importSheetMetaData.getEntityType(), entityRequest.getUuid()));
                        processRequest(entityRequest);
                        logger.info(String.format("Saved/Updated %s with UUID %s", importSheetMetaData.getEntityType(), entityRequest.getUuid()));
                    } catch (Exception e) {
                        dataImportResult.exceptionHappened(importSheetMetaData.asMap(), e);
                    }

                });
        logger.info(String.format("Imported Sheet: %s", importSheetMetaData.getSheetName()));
        return true;
    }
}