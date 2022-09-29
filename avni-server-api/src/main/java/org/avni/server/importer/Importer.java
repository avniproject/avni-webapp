package org.avni.server.importer;

import org.apache.poi.ss.usermodel.Row;
import org.avni.server.dao.ConceptRepository;
import org.avni.server.dao.UserRepository;
import org.avni.server.dao.application.FormElementRepository;
import org.avni.server.domain.Concept;
import org.avni.server.domain.ConceptDataType;
import org.avni.server.domain.User;
import org.avni.server.domain.UserContext;
import org.avni.server.excel.DataImportResult;
import org.avni.server.excel.ExcelUtil;
import org.avni.server.excel.ImportSheetHeader;
import org.avni.server.excel.data.ImportFile;
import org.avni.server.excel.data.ImportSheet;
import org.avni.server.excel.metadata.*;
import org.avni.server.framework.security.UserContextHolder;
import org.avni.server.web.request.CHSRequest;
import org.avni.server.web.request.ObservationRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.text.SimpleDateFormat;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import java.util.stream.Stream;

public abstract class Importer<T extends CHSRequest> {
    protected static Logger logger = LoggerFactory.getLogger(Importer.class);
    protected boolean inParallel;
    protected UserRepository userRepository;
    private ConceptRepository conceptRepository;
    private FormElementRepository formElementRepository;
    private boolean ignoreMissingAnswers;
    private static Pattern datePattern = Pattern.compile("\b[0-9]+\b|.*[A-Za-z]+.*");

    protected Importer(ConceptRepository conceptRepository, FormElementRepository formElementRepository, UserRepository userRepository) {
        this.conceptRepository = conceptRepository;
        this.formElementRepository = formElementRepository;
        inParallel = true;
        this.userRepository = userRepository;
    }

    protected abstract Boolean processRequest(T entityRequest);

    protected abstract T makeRequest(List<ImportField> allFields, ImportSheetHeader header, ImportSheetMetaData importSheetMetaData, Row row, ImportAnswerMetaDataList answerMetaDataList, ImportCalculatedFields calculatedFields);

    protected ObservationRequest createObservationRequest(Row row, ImportSheetHeader sheetHeader, ImportSheetMetaData sheetMetaData, ImportField importField, String systemFieldName, ImportAnswerMetaDataList answerMetaDataList, ImportCalculatedFields calculatedFields) {
        return createObservationRequest(row, sheetHeader, sheetMetaData, importField, systemFieldName, answerMetaDataList, calculatedFields, null);
    }

    protected ObservationRequest createObservationRequest(Row row, ImportSheetHeader sheetHeader, ImportSheetMetaData sheetMetaData, ImportField importField, String systemFieldName, ImportAnswerMetaDataList answerMetaDataList, ImportCalculatedFields calculatedFields, Date referenceDate) {
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
        } else if (ConceptDataType.dateType(concept.getDataType())) {
            cellValue = importField.getTextValue(row, sheetHeader, sheetMetaData);
            if (cellValue != null) {
                if (datePattern.matcher(((String) cellValue)).matches())
                    cellValue = ExcelUtil.getDateFromDuration(cellValue.toString(), referenceDate);
                else
                    cellValue = importField.getDateValue(row, sheetHeader, sheetMetaData);

                cellValue = toISODateFormat((Date) cellValue);
            }
        } else {
            cellValue = importField.getBooleanValue(row, sheetHeader, sheetMetaData);
        }
        if (cellValue == null) return null;

        if (ConceptDataType.Coded.toString().equals(concept.getDataType())) {
            ignoreMissingAnswers = importField.doIgnoreMissingAnswers();
            cellValue = getCodedConceptValue((String) cellValue, calculatedFields, concept, systemFieldName, answerMetaDataList,ignoreMissingAnswers);
        }

        if (cellValue == null) return null;
        observationRequest.setValue(cellValue);
        return observationRequest;
    }

    private Object getCodedConceptValue(String cellValue, ImportCalculatedFields calculatedFields, Concept concept, String systemFieldName, ImportAnswerMetaDataList answerMetaDataList, boolean ignoreMissingAnswers) {
        ImportCalculatedField calculatedField = calculatedFields.stream().filter(x -> x.getSystemField().equals(systemFieldName)).findFirst().orElse(null);
        if (calculatedField != null && calculatedField.isMultiSelect()) {
            List<String> answers = calculatedField.getCodedValues(cellValue);
            return answers.stream()
                    .map((userAnswer) -> getConceptUuid(concept, systemFieldName, answerMetaDataList, userAnswer, ignoreMissingAnswers))
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());
        }
        return getConceptUuid(concept, systemFieldName, answerMetaDataList, cellValue, ignoreMissingAnswers);
    }

    private String getConceptUuid(Concept concept, String systemFieldName, ImportAnswerMetaDataList answerMetaDataList, String userAnswer, boolean ignoreMissingAnswers) {
        String systemAnswer = answerMetaDataList.getSystemAnswer(userAnswer, concept.getName());
        if (systemAnswer == null|| ignoreMissingAnswers) {
            return null;
        }
        Concept answerConcept = conceptRepository.findByNameIgnoreCase(systemAnswer.trim());
        if (answerConcept == null) {
            logger.error(String.format("Answer concept |%s| not found in concept |%s|", userAnswer, systemFieldName));
            throw new NullPointerException(String.format("Answer concept |%s| not found in concept |%s|", userAnswer, systemFieldName));
        }
        return answerConcept.getUuid();
    }

    private String toISODateFormat(Date date) {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
        sdf.setTimeZone(TimeZone.getTimeZone("IST"));
        return sdf.format(date);
    }

    protected void mergeObservations(List<ObservationRequest> observationRequests, ObservationRequest observationRequest) {
        ObservationRequest existingObservationRequest = observationRequests.stream().filter(x -> x.getConceptName().equals(observationRequest.getConceptName())).findAny().orElse(null);
        if (existingObservationRequest == null) observationRequests.add(observationRequest);
        else {
            Object oldValue = existingObservationRequest.getValue();
            Object newValue = observationRequest.getValue();
            if (oldValue instanceof Collection) {
                Collection existingValue = (Collection) oldValue;
                if (observationRequest.getValue() instanceof Collection) {
                    existingValue.addAll((Collection) newValue);
                } else {
                    existingValue.add(newValue);
                }
                existingObservationRequest.setValue(existingValue);
            } else {
                if (observationRequest.getValue() instanceof Collection) {
                    ((Collection) newValue).add(oldValue);
                    existingObservationRequest.setValue(newValue);
                } else {
                    existingObservationRequest.setValue(new ArrayList<>(Arrays.asList(oldValue, newValue)));
                }
            }
        }
    }

    public List importSheet(ImportFile importFile, ImportMetaData importMetaData, ImportSheetMetaData importSheetMetaData, DataImportResult dataImportResult, boolean performImport, Integer maxNumberOfRecords) {
        List<ImportField> allFields = importMetaData.getAllFields(importSheetMetaData);
        logger.info(String.format("Reading Sheet: %s", importSheetMetaData.getSheetName()));
        ImportSheet importSheet = importFile.getSheet(importSheetMetaData.getSheetName());
        ImportSheetHeader header = importSheet.getHeader();
        UserContext userContext = UserContextHolder.getUserContext();
        SecurityContext context = SecurityContextHolder.getContext();
        int numberOfDataRows = importSheet.getNumberOfDataRows();
        AtomicInteger importedRowCount = new AtomicInteger(0);
        List list = Collections.synchronizedList(new ArrayList<>());
        IntStream intStream = IntStream.range(0, numberOfDataRows);
        IntStream stream = (performImport && inParallel && maxNumberOfRecords == null) ? intStream.parallel() : intStream;
        Stream<Row> rowStream = stream.mapToObj(importSheet::getDataRow).filter(Objects::nonNull);
        (maxNumberOfRecords != null ? rowStream.limit(maxNumberOfRecords) : rowStream)
                .forEach((row) -> {
                    SecurityContextHolder.setContext(context);
                    UserContextHolder.create(userContext); //Use this user context, till the importer reads the rows and sets its own user context if it finds the user data
                    T entityRequest = (T) new CHSRequest();
                    try {
                        logger.info(String.format("Creating Request for %s", importSheetMetaData.getEntityType()));
                        entityRequest = makeRequest(allFields, header, importSheetMetaData, row, importMetaData.getAnswerMetaDataList(), importMetaData.getCalculatedFields());
                        if (!performImport)
                            list.add(entityRequest);
                        if (performImport) {
                            logger.info(String.format("Saving/Updating %s with UUID %s", importSheetMetaData.getEntityType(), entityRequest.getUuid()));
                            processRequest(entityRequest);
                            logger.info(String.format("Saved/Updated %s with UUID %s", importSheetMetaData.getEntityType(), entityRequest.getUuid()));
                            logger.info(String.format("[IMPORTED] %d/%d ROWS", importedRowCount.incrementAndGet(), numberOfDataRows));
                        }
                    } catch (Exception e) {
                        logger.error(String.format("Failed %s with UUID %s with error %s", importSheetMetaData.getEntityType(), entityRequest.getUuid(), e.getMessage()));
                        dataImportResult.exceptionHappened(importSheetMetaData.asMap(), e);
                    }

                });
        logger.info(String.format("Imported Sheet: %s", importSheetMetaData.getSheetName()));
        return list;
    }

    protected void setUser(ImportSheetHeader header, ImportSheetMetaData importSheetMetaData, Row row, ImportField importField) {
        User user = userRepository.findByUsername(importField.getTextValue(row, header, importSheetMetaData));
        if (user != null)
            UserContextHolder.getUserContext().setUser(user);
    }
}
