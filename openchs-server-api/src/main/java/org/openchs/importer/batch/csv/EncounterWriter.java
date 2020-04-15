package org.openchs.importer.batch.csv;

import org.joda.time.DateTime;
import org.joda.time.LocalDate;
import org.openchs.application.Form;
import org.openchs.application.FormElement;
import org.openchs.application.FormElementType;
import org.openchs.application.FormType;
import org.openchs.dao.*;
import org.openchs.dao.application.FormRepository;
import org.openchs.domain.*;
import org.openchs.geo.Point;
import org.openchs.importer.batch.model.Row;
import org.openchs.service.ObservationService;
import org.openchs.web.request.ObservationRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.batch.item.ItemWriter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.Serializable;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeFormatterBuilder;
import java.time.temporal.ChronoField;
import java.time.temporal.TemporalAccessor;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;


@Component
public class EncounterWriter implements ItemWriter<Row>, Serializable {

    private final AddressLevelTypeRepository addressLevelTypeRepository;
    private final ConceptRepository conceptRepository;
    private final ObservationService observationService;
    private final FormRepository formRepository;
    private final EncounterTypeRepository encounterTypeRepository;
    private EncounterRepository encounterRepository;
    private IndividualRepository individualRepository;
    private static Logger logger = LoggerFactory.getLogger(EncounterWriter.class);
    private static EncounterFixedHeaders headers = new EncounterFixedHeaders();


    @Autowired
    public EncounterWriter(AddressLevelTypeRepository addressLevelTypeRepository,
                           ConceptRepository conceptRepository,
                           ObservationService observationService,
                           FormRepository formRepository,
                           EncounterTypeRepository encounterTypeRepository,
                           EncounterRepository encounterRepository,
                           IndividualRepository individualRepository) {
        this.addressLevelTypeRepository = addressLevelTypeRepository;
        this.conceptRepository = conceptRepository;
        this.observationService = observationService;
        this.formRepository = formRepository;
        this.encounterTypeRepository = encounterTypeRepository;
        this.encounterRepository = encounterRepository;
        this.individualRepository = individualRepository;
    }

    @Override
    public void write(List<? extends Row> rows) throws Exception {
        for (Row row : rows) write(row);
    }

    private void write(Row row) throws Exception {
        List<AddressLevelType> locationTypes = addressLevelTypeRepository.findAll();
        locationTypes.sort(Comparator.comparingDouble(AddressLevelType::getLevel).reversed());

        Set<String> nonConceptHeaders = Stream.of(headers.getAllHeaders()).collect(Collectors.toSet());

        List<Concept> obsConcepts = getConceptHeaders(row.getHeaders(), nonConceptHeaders)
                .stream()
                .map(conceptRepository::findByName)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        Encounter encounter = getOrCreateEncounter(row);

        List<String> allErrorMsgs = new ArrayList<>();

        encounter.setIndividual(getSubject(row, allErrorMsgs));

        encounter.setEarliestVisitDateTime(new DateTime(
                getDate(
                        row,
                        headers.earliestVisitDate,
                        allErrorMsgs, null
                )));
        encounter.setMaxVisitDateTime(new DateTime(
                getDate(
                        row,
                        headers.maxVisitDate,
                        allErrorMsgs, null
                )));

        encounter.setEncounterDateTime(new DateTime(
                getDate(
                        row,
                        headers.visitDate,
                        allErrorMsgs, String.format("%s is mandatory", headers.visitDate
                ))));
        encounter.setEncounterLocation(getLocation(row, headers.encounterLocation, allErrorMsgs));
        encounter.setCancelLocation(getLocation(row, headers.cancelLocation, allErrorMsgs));
        encounter.setEncounterType(getEncounterType(row, allErrorMsgs));
        encounter.setObservations(setObservations(row, obsConcepts, allErrorMsgs));

        if (allErrorMsgs.size() > 0) {
            throw new Exception(String.join(", ", allErrorMsgs));
        }

        encounter.setVoided(false);
        encounter.assignUUIDIfRequired();

        encounterRepository.save(encounter);
    }

    private Individual getSubject(Row row, List<String> errorMsgs) {
        String subjectExternalId = row.get(headers.subjectId);
        if (subjectExternalId == null || subjectExternalId.isEmpty()) {
            errorMsgs.add(String.format("'%s' is required", headers.subjectId));
            return null;
        }
        Individual individual = individualRepository.findByLegacyId(subjectExternalId);
        if (individual == null) {
            errorMsgs.add(String.format("'%s' not found in database", headers.subjectId));
            return null;
        }
        return individual;
    }

    private EncounterType getEncounterType(Row row, List<String> errorMsgs) {
        String encounterTypeName = row.get(headers.encounterType);
        if (encounterTypeName == null || encounterTypeName.isEmpty()) {
            errorMsgs.add(String.format("'%s' is required", headers.encounterType));
            return null;
        }
        EncounterType encounterType = encounterTypeRepository.findByName(encounterTypeName);
        if (encounterType == null) {
            errorMsgs.add(String.format("'%s' not found in database", headers.encounterType));
            return null;
        }
        return encounterType;
    }

    private Encounter getOrCreateEncounter(Row row) {
        String legacyId = row.get(headers.id);
        Encounter existingEncounter = null;
        if (legacyId != null && !legacyId.isEmpty()) {
            existingEncounter = encounterRepository.findByLegacyId(legacyId);
        }
        return existingEncounter == null ? createNewEncounter(legacyId) : existingEncounter;
    }

    private Encounter createNewEncounter(String externalId) {
        Encounter encounter = new Encounter();
        encounter.setLegacyId(externalId);
        return encounter;
    }

    private Set<String> getConceptHeaders(String[] allHeaders, Set<String> nonConceptHeaders) {
        return Arrays
                .stream(allHeaders)
                .filter(header -> !nonConceptHeaders.contains(header))
                .collect(Collectors.toSet());
    }

    private LocalDate getDate(Row row, String header, List<String> errorMsgs, String errorMessageIfNotExists) {
        try {
            String date = row.get(header);
            if (date != null) {
                return LocalDate.parse(date);
            }

            if (date == null && errorMessageIfNotExists != null) {
                errorMsgs.add(errorMessageIfNotExists);
            }

        } catch (Exception ex) {
            logger.error(String.format("Error processing row %s", row), ex);
            errorMsgs.add(String.format("Invalid '%s'", header));
        } finally {
            return null;
        }
    }

    private Point getLocation(Row row, String header, List<String> errorMsgs) {
        try {
            String location = row.get(header);
            if (location != null) {
                String[] points = location.split(",");
                return new Point(Double.parseDouble(points[0]), Double.parseDouble(points[1]));
            }
        } catch (Exception ex) {
            logger.error(String.format("Error processing row %s", row), ex);
            errorMsgs.add(String.format("Invalid '%s'", header));
            return null;
        }
        return null;
    }

    private ObservationCollection setObservations(Row row,
                                                  List<Concept> obsConcepts,
                                                  List<String> errorMsgs) {
        List<ObservationRequest> observationRequests = new ArrayList<>();
        for (Concept concept : obsConcepts) {
            String rowValue = row.get(concept.getName());
            if (rowValue == null || rowValue.trim().equals(""))
                continue;
            ObservationRequest observationRequest = new ObservationRequest();
            observationRequest.setConceptName(concept.getName());
            observationRequest.setConceptUUID(concept.getUuid());
            try {
                observationRequest.setValue(getObservationValue(concept, rowValue));
            } catch (Exception ex) {
                logger.error(String.format("Error processing observation %s in row %s", rowValue, row), ex);
                errorMsgs.add(String.format("Invalid answer '%s' for '%s'", rowValue, concept.getName()));
            }
            observationRequests.add(observationRequest);
        }
        return observationService.createObservations(observationRequests);
    }

    private Object getObservationValue(Concept concept, String answerValue) throws Exception {
        switch (ConceptDataType.valueOf(concept.getDataType())) {
            case Coded:
                List<Form> individualProfileForms = formRepository.findAllByFormType(FormType.IndividualProfile);
                if (individualProfileForms.size() == 0)
                    throw new Exception("No forms of type IndividualProfile found");

                FormElement formElement = individualProfileForms.stream()
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
}
