package org.openchs.importer.batch.csv.creator;

import org.apache.commons.io.FileUtils;
import org.openchs.application.Form;
import org.openchs.application.FormElement;
import org.openchs.application.FormElementType;
import org.openchs.application.FormType;
import org.openchs.dao.AddressLevelTypeRepository;
import org.openchs.dao.ConceptRepository;
import org.openchs.dao.application.FormRepository;
import org.openchs.domain.AddressLevelType;
import org.openchs.domain.Concept;
import org.openchs.domain.ConceptDataType;
import org.openchs.domain.ObservationCollection;
import org.openchs.importer.batch.csv.writer.header.Headers;
import org.openchs.importer.batch.model.Row;
import org.openchs.service.ObservationService;
import org.openchs.service.S3Service;
import org.openchs.util.S;
import org.openchs.web.request.ObservationRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.*;
import java.net.URL;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeFormatterBuilder;
import java.time.temporal.ChronoField;
import java.time.temporal.TemporalAccessor;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static java.lang.String.format;

@Component
public class ObservationCreator {

    private static Logger logger = LoggerFactory.getLogger(ObservationCreator.class);
    private AddressLevelTypeRepository addressLevelTypeRepository;
    private ConceptRepository conceptRepository;
    private FormRepository formRepository;
    private ObservationService observationService;
    private S3Service s3Service;

    @Autowired
    public ObservationCreator(AddressLevelTypeRepository addressLevelTypeRepository,
                              ConceptRepository conceptRepository, FormRepository formRepository, ObservationService observationService, S3Service s3Service) {
        this.addressLevelTypeRepository = addressLevelTypeRepository;
        this.conceptRepository = conceptRepository;
        this.formRepository = formRepository;
        this.observationService = observationService;
        this.s3Service = s3Service;
    }

    public List<Concept> getConceptHeaders(Headers fixedHeaders, String[] fileHeaders) {
        List<AddressLevelType> locationTypes = addressLevelTypeRepository.findAll();
        locationTypes.sort(Comparator.comparingDouble(AddressLevelType::getLevel).reversed());

        Set<String> nonConceptHeaders = Stream.concat(
                locationTypes.stream().map(AddressLevelType::getName),
                Stream.of(fixedHeaders.getAllHeaders())).collect(Collectors.toSet());

        List<Concept> obsConcepts = getConceptHeaders(fileHeaders, nonConceptHeaders)
                .stream()
                .map(conceptRepository::findByName)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
        return obsConcepts;
    }

    public ObservationCollection getObservations(Row row,
                                                 Headers headers,
                                                 List<String> errorMsgs, FormType formType, ObservationCollection oldObservations) {
        List<ObservationRequest> observationRequests = new ArrayList<>();

        for (Concept concept : getConceptHeaders(headers, row.getHeaders())) {
            String rowValue = row.get(concept.getName());
            if (rowValue == null || rowValue.trim().equals(""))
                continue;
            ObservationRequest observationRequest = new ObservationRequest();
            observationRequest.setConceptName(concept.getName());
            observationRequest.setConceptUUID(concept.getUuid());
                Object oldValue = oldObservations == null ? null : oldObservations.getOrDefault(concept.getUuid(), null);
            try {
                observationRequest.setValue(getObservationValue(concept, rowValue, formType, errorMsgs, oldValue));
            } catch (Exception ex) {
                logger.error(String.format("Error processing observation %s in row %s", rowValue, row), ex);
                errorMsgs.add(String.format("Invalid answer '%s' for '%s'", rowValue, concept.getName()));
            }
            observationRequests.add(observationRequest);
        }
        return observationService.createObservations(observationRequests);
    }

    private Object getObservationValue(Concept concept, String answerValue, FormType formType, List<String> errorMsgs, Object oldValue) throws Exception {
        switch (ConceptDataType.valueOf(concept.getDataType())) {
            case Coded:
                List<Form> applicableForms = formRepository.findAllByFormType(formType);
                if (applicableForms.size() == 0)
                    throw new Exception(String.format("No forms of type %s found", formType));

                FormElement formElement = applicableForms.stream()
                        .map(Form::getAllFormElements)
                        .flatMap(List::stream)
                        .filter(fel -> fel.getConcept().equals(concept))
                        .findFirst()
                        .orElseThrow(() -> new Exception("No form element linked to concept found"));

                if (formElement.getType().equals(FormElementType.MultiSelect.name())) {
                    /* For multi-select answers, expected input format would be:
                       1. Answer 1, Answer 2, ...
                       2. Answer 1, "Answer2, has, commas", Answer 3, ...
                       ... etc.
                    */
                    String[] providedAnswers = Stream.of(answerValue.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)"))
                            .map(value -> value.trim().replaceAll("\"", ""))
                            .toArray(String[]::new);
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
                return (answerValue.trim().equals("")) ? null : processMediaObservation(answerValue, errorMsgs, oldValue);
            default:
                return answerValue;
        }
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

    private String processMediaObservation(String mediaURL, List<String> errorMsgs, Object oldValue) throws IOException {
        if (oldValue != null) {
            s3Service.deleteObject(S.getLastStringAfter((String) oldValue, "/"));
        }
        String extension = S.getLastStringAfter(mediaURL, ".");
        File file = new File(format("%s/imports/%s", System.getProperty("java.io.tmpdir"), UUID.randomUUID().toString().concat(format(".%s", extension))));
        downloadMediaToFile(mediaURL, errorMsgs, file);
        return s3Service.uploadFileToS3(file);
    }

    private void downloadMediaToFile(String mediaURL, List<String> errorMsgs, File file) {
        try {
            FileUtils.copyURLToFile(new URL(mediaURL), file, 5000, 5000);
        } catch (IOException e) {
            String message = format("Error while downloading media '%s' ", mediaURL);
            logger.error(message, e);
            errorMsgs.add(message);
        }
    }
}
