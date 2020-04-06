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
public class ProgramEncounterWriter implements ItemWriter<Row>, Serializable {
    private enum FixedHeaders {
        id("Id"),
        encounterType("Encounter Type"),
        enrolmentId("Enrolment Id"),
        visitDate("Visit Date"),
        earliestVisitDate("Earliest Visit Date"),
        maxVisitDate("Max Visit Date"),
        encounterLocation("Encounter Location"),
        cancelLocation("Cancel Location");

        private final String headerValue;

        FixedHeaders(String headerValue) {
            this.headerValue = headerValue;
        }

        public String getHeader() {
            return headerValue;
        }

        public static String[] getAllHeaders() {
            return Arrays.stream(FixedHeaders.values()).map(FixedHeaders::getHeader).toArray(String[]::new);
        }
    }

    private final AddressLevelTypeRepository addressLevelTypeRepository;
    private final ConceptRepository conceptRepository;
    private final ObservationService observationService;
    private final FormRepository formRepository;
    private final IndividualRepository individualRepository;
    private final ProgramEnrolmentRepository programEnrolmentRepository;
    private final ProgramRepository programRepository;
    private final ProgramEncounterRepository programEncounterRepository;
    private final EncounterTypeRepository encounterTypeRepository;
    private static Logger logger = LoggerFactory.getLogger(ProgramEncounterWriter.class);


    @Autowired
    public ProgramEncounterWriter(AddressLevelTypeRepository addressLevelTypeRepository,
                                  ConceptRepository conceptRepository,
                                  ObservationService observationService,
                                  FormRepository formRepository,
                                  IndividualRepository individualRepository,
                                  ProgramEnrolmentRepository programEnrolmentRepository,
                                  ProgramRepository programRepository, ProgramEncounterRepository programEncounterRepository, EncounterTypeRepository encounterTypeRepository) {
        this.addressLevelTypeRepository = addressLevelTypeRepository;
        this.conceptRepository = conceptRepository;
        this.observationService = observationService;
        this.formRepository = formRepository;
        this.individualRepository = individualRepository;
        this.programEnrolmentRepository = programEnrolmentRepository;
        this.programRepository = programRepository;
        this.programEncounterRepository = programEncounterRepository;
        this.encounterTypeRepository = encounterTypeRepository;
    }

    @Override
    public void write(List<? extends Row> rows) throws Exception {
        for (Row row : rows) write(row);
    }

    private void write(Row row) throws Exception {
        List<AddressLevelType> locationTypes = addressLevelTypeRepository.findAll();
        locationTypes.sort(Comparator.comparingDouble(AddressLevelType::getLevel).reversed());

        Set<String> nonConceptHeaders = Stream.of(FixedHeaders.getAllHeaders()).collect(Collectors.toSet());

        List<Concept> obsConcepts = getConceptHeaders(row.getHeaders(), nonConceptHeaders)
                .stream()
                .map(conceptRepository::findByName)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        ProgramEncounter programEncounter = getOrCreateProgramEncounter(row);

        List<String> allErrorMsgs = new ArrayList<>();

        programEncounter.setProgramEnrolment(getProgramEnrolment(row, allErrorMsgs));

        programEncounter.setEarliestVisitDateTime(new DateTime(
                getDate(
                        row,
                        FixedHeaders.earliestVisitDate.getHeader(),
                        allErrorMsgs, null
                )));
        programEncounter.setMaxVisitDateTime(new DateTime(
                getDate(
                        row,
                        FixedHeaders.maxVisitDate.getHeader(),
                        allErrorMsgs, null
                )));

        programEncounter.setEncounterDateTime(new DateTime(
                getDate(
                        row,
                        FixedHeaders.visitDate.getHeader(),
                        allErrorMsgs, String.format("%s is mandatory", FixedHeaders.visitDate.getHeader()
                ))));
        programEncounter.setEncounterLocation(getLocation(row, FixedHeaders.encounterLocation.getHeader(), allErrorMsgs));
        programEncounter.setCancelLocation(getLocation(row, FixedHeaders.cancelLocation.getHeader(), allErrorMsgs));
        programEncounter.setEncounterType(getEncounterType(row, allErrorMsgs));
        programEncounter.setObservations(setObservations(row, obsConcepts, allErrorMsgs));

        if (allErrorMsgs.size() > 0) {
            throw new Exception(String.join(", ", allErrorMsgs));
        }

        programEncounter.setVoided(false);
        programEncounter.assignUUIDIfRequired();

        programEncounterRepository.save(programEncounter);
    }

    private ProgramEnrolment getProgramEnrolment(Row row, List<String> errorMsgs) {
        String programEnrolmentLegacyId = row.get(FixedHeaders.enrolmentId.getHeader());
        if (programEnrolmentLegacyId == null || programEnrolmentLegacyId.isEmpty()) {
            errorMsgs.add(String.format("'%s' is required", FixedHeaders.enrolmentId.getHeader()));
            return null;
        }
        ProgramEnrolment programEnrolment = programEnrolmentRepository.findByLegacyId(programEnrolmentLegacyId);
        if (programEnrolment == null) {
            errorMsgs.add(String.format("'%s' not found in database", FixedHeaders.enrolmentId.getHeader()));
            return null;
        }
        return programEnrolment;
    }

    private EncounterType getEncounterType(Row row, List<String> errorMsgs) {
        String encounterTypeName = row.get(FixedHeaders.encounterType.getHeader());
        if (encounterTypeName == null || encounterTypeName.isEmpty()) {
            errorMsgs.add(String.format("'%s' is required", FixedHeaders.encounterType.getHeader()));
            return null;
        }
        EncounterType encounterType = encounterTypeRepository.findByName(encounterTypeName);
        if (encounterType == null) {
            errorMsgs.add(String.format("'%s' not found in database", FixedHeaders.encounterType.getHeader()));
            return null;
        }
        return encounterType;
    }

    private ProgramEncounter getOrCreateProgramEncounter(Row row) {
        String legacyId = row.get(FixedHeaders.id.getHeader());
        ProgramEncounter existingEncounter = null;
        if (legacyId != null && !legacyId.isEmpty()) {
            existingEncounter = programEncounterRepository.findByLegacyId(legacyId);
        }
        return existingEncounter == null ? createNewEncounter(legacyId) : existingEncounter;
    }

    private ProgramEncounter createNewEncounter(String externalId) {
        ProgramEncounter programEncounter = new ProgramEncounter();
        programEncounter.setLegacyId(externalId);
        return programEncounter;
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
