package org.avni.server.importer.batch.csv.creator;

import org.avni.server.application.Form;
import org.avni.server.application.FormElement;
import org.avni.server.application.FormElementType;
import org.avni.server.application.FormType;
import org.avni.server.dao.AddressLevelTypeRepository;
import org.avni.server.dao.ConceptRepository;
import org.avni.server.dao.application.FormElementRepository;
import org.avni.server.dao.application.FormRepository;
import org.avni.server.domain.AddressLevelType;
import org.avni.server.domain.Concept;
import org.avni.server.domain.ConceptDataType;
import org.avni.server.domain.ObservationCollection;
import org.avni.server.importer.batch.csv.writer.header.Headers;
import org.avni.server.importer.batch.model.Row;
import org.avni.server.service.IndividualService;
import org.avni.server.service.LocationService;
import org.avni.server.service.ObservationService;
import org.avni.server.service.S3Service;
import org.avni.server.util.S;
import org.avni.server.web.request.ObservationRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeFormatterBuilder;
import java.time.temporal.ChronoField;
import java.time.temporal.TemporalAccessor;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static java.lang.String.format;

@Component
public class ObservationCreator {

    private static final String PHONE_NUMBER_PATTERN = "^[0-9]{10}";
    private static Logger logger = LoggerFactory.getLogger(ObservationCreator.class);
    private AddressLevelTypeRepository addressLevelTypeRepository;
    private ConceptRepository conceptRepository;
    private FormRepository formRepository;
    private ObservationService observationService;
    private S3Service s3Service;
    private IndividualService individualService;
    private LocationService locationService;
    private FormElementRepository formElementRepository;

    @Autowired
    public ObservationCreator(AddressLevelTypeRepository addressLevelTypeRepository,
                              ConceptRepository conceptRepository,
                              FormRepository formRepository,
                              ObservationService observationService,
                              S3Service s3Service,
                              IndividualService individualService,
                              LocationService locationService,
                              FormElementRepository formElementRepository) {
        this.addressLevelTypeRepository = addressLevelTypeRepository;
        this.conceptRepository = conceptRepository;
        this.formRepository = formRepository;
        this.observationService = observationService;
        this.s3Service = s3Service;
        this.individualService = individualService;
        this.locationService = locationService;
        this.formElementRepository = formElementRepository;
    }

    public Set<Concept> getConceptHeaders(Headers fixedHeaders, String[] fileHeaders) {
        List<AddressLevelType> locationTypes = addressLevelTypeRepository.findAll();
        locationTypes.sort(Comparator.comparingDouble(AddressLevelType::getLevel).reversed());

        Set<String> nonConceptHeaders = Stream.concat(
                locationTypes.stream().map(AddressLevelType::getName),
                Stream.of(fixedHeaders.getAllHeaders())).collect(Collectors.toSet());

        return getConceptHeaders(fileHeaders, nonConceptHeaders)
                .stream()
                .map(name -> this.findConcept(name, false))
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
    }

    private Concept findConcept(String name, boolean isChildQuestionGroup) {
        Concept concept = conceptRepository.findByName(name);
        if (concept == null && name.contains("|")) {
            String[] parentChildNameArray = name.split("\\|");
            String questionGroupConceptName = isChildQuestionGroup ? parentChildNameArray[1] : parentChildNameArray[0];
            concept = conceptRepository.findByName(questionGroupConceptName);
        }
        return concept;
    }

    public ObservationCollection getObservations(Row row,
                                                 Headers headers,
                                                 List<String> errorMsgs, FormType formType, ObservationCollection oldObservations) throws Exception {
        ObservationCollection observationCollection = constructObservations(row, headers, errorMsgs, formType, oldObservations);
        if (errorMsgs.size() > 0) {
            throw new Exception(String.join(", ", errorMsgs));
        }
        return observationCollection;
    }

    private boolean isNonEmptyQuestionGroup(FormElement formElement, Row row) {
        Concept concept = formElement.getConcept();
        if (ConceptDataType.isGroupQuestion(concept.getDataType())) {
            List<FormElement> allChildQuestions = formElementRepository.findAllByGroupId(formElement.getId());
            return allChildQuestions.stream().anyMatch(fe -> {
                String parentChildName = concept.getName() + "|" + fe.getConcept().getName();
                String headerName = formElement.isRepeatable() ? String.format("%s|1", parentChildName) : parentChildName;
                String rowValue = row.get(headerName);
                return !(rowValue == null || rowValue.trim().equals(""));
            });
        }
        return false;
    }

    private String getRowValue(FormElement formElement, Row row, Integer questionGroupIndex) {
        Concept concept = formElement.getConcept();
        if(formElement.getGroup() != null) {
            Concept parentConcept = formElement.getGroup().getConcept();
            String parentChildName = parentConcept.getName() + "|" + concept.getName();
            String headerName = questionGroupIndex == null ? parentChildName : String.format("%s|%d", parentChildName, questionGroupIndex);
            return row.get(headerName);
        }
        return row.get(concept.getName());
    }

    private ObservationCollection constructObservations(Row row, Headers headers, List<String> errorMsgs, FormType formType, ObservationCollection oldObservations) throws Exception {
        List<ObservationRequest> observationRequests = new ArrayList<>();
        for (Concept concept : getConceptHeaders(headers, row.getHeaders())) {
            FormElement formElement = getFormElementForObservationConcept(concept, formType);
            String rowValue = getRowValue(formElement, row, null);
            if (!isNonEmptyQuestionGroup(formElement, row) && (rowValue == null || rowValue.trim().equals("")))
                continue;
            ObservationRequest observationRequest = new ObservationRequest();
            observationRequest.setConceptName(concept.getName());
            observationRequest.setConceptUUID(concept.getUuid());
            try {
                observationRequest.setValue(getObservationValue(formElement, rowValue, formType, errorMsgs, row, headers, oldObservations));
            } catch (Exception ex) {
                logger.error(String.format("Error processing observation %s in row %s", rowValue, row), ex);
                errorMsgs.add(String.format("Invalid answer '%s' for '%s'", rowValue, concept.getName()));
            }
            observationRequests.add(observationRequest);
        }
        return observationService.createObservations(observationRequests);
    }

    // For the repeatable question group columns should be "Question group concept"|"Child concept"|"order(1,2,3...)"
    private Object constructChildObservations(Row row, Headers headers, List<String> errorMsgs, FormElement parentFormElement, FormType formType, ObservationCollection oldObservations) {
        List<FormElement> allChildQuestions = formElementRepository.findAllByGroupId(parentFormElement.getId());
        if (parentFormElement.isRepeatable()) {
            Pattern repeatableQuestionGroupPattern = Pattern.compile(String.format("%s\\|.*\\|\\d", parentFormElement.getConcept().getName()));
            List<String> repeatableQuestionGroupHeaders = Stream.of(row.getHeaders())
                    .filter(repeatableQuestionGroupPattern.asPredicate())
                    .collect(Collectors.toList());
            int maxIndex = repeatableQuestionGroupHeaders.stream().map(fen -> Integer.valueOf(fen.split("\\|")[2]))
                    .mapToInt(v -> v)
                    .max().orElse(1);
            List<ObservationCollection> repeatableObservationRequest = new ArrayList<>();
            for (int i = 1; i <= maxIndex; i++) {
                ObservationCollection questionGroupObservations = getQuestionGroupObservations(row, headers, errorMsgs, formType, oldObservations, allChildQuestions, i);
                if(!questionGroupObservations.isEmpty()) {
                    repeatableObservationRequest.add(questionGroupObservations);
                }
            }
            return repeatableObservationRequest;
        }
        return getQuestionGroupObservations(row, headers, errorMsgs, formType, oldObservations, allChildQuestions, null);
    }

    private ObservationCollection getQuestionGroupObservations(Row row, Headers headers, List<String> errorMsgs, FormType formType, ObservationCollection oldObservations, List<FormElement> allChildQuestions, Integer questionGroupIndex) {
        List<ObservationRequest> observationRequests = new ArrayList<>();
        for (FormElement formElement : allChildQuestions) {
            Concept concept = formElement.getConcept();
            String rowValue = getRowValue(formElement, row, questionGroupIndex);
            if (rowValue == null || rowValue.trim().equals(""))
                continue;
            ObservationRequest observationRequest = new ObservationRequest();
            observationRequest.setConceptName(concept.getName());
            observationRequest.setConceptUUID(concept.getUuid());
            try {
                observationRequest.setValue(getObservationValue(formElement, rowValue, formType, errorMsgs, row, headers, oldObservations));
            } catch (Exception ex) {
                logger.error(String.format("Error processing observation %s in row %s", rowValue, row), ex);
                errorMsgs.add(String.format("Invalid answer '%s' for '%s'", rowValue, concept.getName()));
            }
            observationRequests.add(observationRequest);
        }
        return observationService.createObservations(observationRequests);
    }

    private List<FormElement> createDecisionFormElement(Set<Concept> concepts) {
        return concepts.stream().map(dc -> {
            FormElement formElement = new FormElement();
            formElement.setType(dc.getDataType().equals(ConceptDataType.Coded.name()) ? FormElementType.MultiSelect.name() : FormElementType.SingleSelect.name());
            formElement.setConcept(dc);
            return formElement;
        }).collect(Collectors.toList());
    }

    private FormElement getFormElementForObservationConcept(Concept concept, FormType formType) throws Exception {
        List<Form> applicableForms = formRepository.findByFormTypeAndIsVoidedFalse(formType);
        if (applicableForms.size() == 0)
            throw new Exception(String.format("No forms of type %s found", formType));

        return applicableForms.stream()
                .map(f -> {
                    List<FormElement> formElements = f.getAllFormElements();
                    formElements.addAll(createDecisionFormElement(f.getDecisionConcepts()));
                    return formElements;
                })
                .flatMap(List::stream)
                .filter(fel -> fel.getConcept().equals(concept))
                .findFirst()
                .orElseThrow(() -> new Exception("No form element linked to concept found"));
    }

    private Object getObservationValue(FormElement formElement, String answerValue, FormType formType, List<String> errorMsgs, Row row, Headers headers, ObservationCollection oldObservations) throws Exception {
        Concept concept = formElement.getConcept();
        Object oldValue = oldObservations == null ? null : oldObservations.getOrDefault(concept.getUuid(), null);
        switch (ConceptDataType.valueOf(concept.getDataType())) {
            case Coded:
                if (formElement.getType().equals(FormElementType.MultiSelect.name())) {
                    String[] providedAnswers = S.splitMultiSelectAnswer(answerValue);
                    return Stream.of(providedAnswers)
                            .map(answer -> concept.findAnswerConcept(answer).getUuid())
                            .collect(Collectors.toList());
                } else {
                    return concept.findAnswerConcept(answerValue).getUuid();
                }
            case Numeric:
                return Double.parseDouble(answerValue);
            case Date:
            case DateTime:
                return (answerValue.trim().equals("")) ? null : toISODateFormat(answerValue);
            case Image:
            case Video:
                if (formElement.getType().equals(FormElementType.MultiSelect.name())) {
                    String[] providedURLs = S.splitMultiSelectAnswer(answerValue);
                    return Stream.of(providedURLs)
                            .map(url -> getMediaObservationValue(url, errorMsgs, null))
                            .collect(Collectors.toList());
                } else {
                    return getMediaObservationValue(answerValue, errorMsgs, oldValue);
                }
            case Subject:
                return individualService.getObservationValueForUpload(formElement, answerValue);
            case Location:
                return locationService.getObservationValueForUpload(formElement, answerValue);
            case PhoneNumber:
                return (answerValue.trim().equals("")) ? null : toPhoneNumberFormat(answerValue.trim(), errorMsgs, concept.getName());
            case QuestionGroup:
                return this.constructChildObservations(row, headers, errorMsgs, formElement, formType, null);
            default:
                return answerValue;
        }
    }

    private Object getMediaObservationValue(String answerValue, List<String> errorMsgs, Object oldValue) {
        try {
            return s3Service.getObservationValueForUpload(answerValue, oldValue);
        } catch (Exception e) {
            errorMsgs.add(e.getMessage());
            return null;
        }
    }

    private Map<String, Object> toPhoneNumberFormat(String phoneNumber, List<String> errorMsgs, String conceptName) {
        Map<String, Object> phoneNumberObs = new HashMap<>();
        if (!phoneNumber.matches(PHONE_NUMBER_PATTERN)) {
            errorMsgs.add(format("Invalid %s provided %s. Please provide 10 digit number.", conceptName, phoneNumber));
            return null;
        }
        phoneNumberObs.put("phoneNumber", phoneNumber);
        phoneNumberObs.put("verified", false);
        return phoneNumberObs;
    }

    private String toISODateFormat(String dateStr) {
        DateTimeFormatter outputFmt = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
        DateTimeFormatter parseFmt = new DateTimeFormatterBuilder()
                .appendPattern("yyyy-MM-dd[ HH:mm:ss]")
                .parseDefaulting(ChronoField.HOUR_OF_DAY, 0)
                .parseDefaulting(ChronoField.MINUTE_OF_HOUR, 0)
                .parseDefaulting(ChronoField.SECOND_OF_MINUTE, 0)
                .toFormatter();
        TemporalAccessor parsed = parseFmt.parseBest(dateStr, ZonedDateTime::from, java.time.LocalDate::from);
        ZonedDateTime dt = null;
        if (parsed instanceof ZonedDateTime) {
            dt = (ZonedDateTime) parsed;
        } else if (parsed instanceof java.time.LocalDate) {
            dt = ((java.time.LocalDate) parsed).atStartOfDay(ZoneId.systemDefault());
        }
        return dt.format(outputFmt);
    }

    private Set<String> getConceptHeaders(String[] allHeaders, Set<String> nonConceptHeaders) {
        return Arrays
                .stream(allHeaders)
                .filter(header -> !nonConceptHeaders.contains(header))
                .collect(Collectors.toSet());
    }
}
