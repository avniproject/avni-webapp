package org.openchs.excel.metadata;

import org.joda.time.LocalDate;
import org.junit.Before;
import org.junit.Test;
import org.mockito.Mock;
import org.openchs.application.FormElement;
import org.openchs.dao.ConceptRepository;
import org.openchs.dao.application.FormElementRepository;
import org.openchs.domain.*;
import org.openchs.excel.data.ImportFile;
import org.openchs.excel.data.ImportSheet;
import org.openchs.excel.reader.ImportMetaDataExcelReader;
import org.openchs.web.request.CHSRequest;
import org.openchs.web.request.IndividualRequest;
import org.openchs.web.request.ProgramEncounterRequest;
import org.openchs.web.request.ProgramEnrolmentRequest;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;
import java.util.*;

import static org.junit.Assert.assertEquals;
import static org.mockito.Matchers.any;
import static org.mockito.Matchers.anyString;
import static org.mockito.Mockito.when;
import static org.mockito.MockitoAnnotations.initMocks;

public class ImportMetaDataTest {
    @Mock
    private ConceptRepository conceptRepository;

    @Mock
    private FormElementRepository formElementRepository;

    private ImportMetaData importMetaData;

    @Before
    public void setup() throws IOException {
        initMocks(this);
        Concept placeHolderConcept = new Concept();
        FormElement placeHolderFormElement = new FormElement();
        placeHolderFormElement.setType("SingleSelect");
        placeHolderFormElement.setConcept(placeHolderConcept);
        placeHolderConcept.setDataType(ConceptDataType.Text.toString());
        when(conceptRepository.findByName(anyString())).thenReturn(placeHolderConcept);
        when(formElementRepository.findFirstByConcept(any(Concept.class))).thenReturn(placeHolderFormElement);
        importMetaData = ImportMetaDataExcelReader.readMetaData(new ClassPathResource("Import MetaData.xlsx").getInputStream());
    }

    @Test
    public void readMetaData() throws IOException {
        ImportSheetMetaDataList importSheets = importMetaData.getImportSheets();
        ImportSheetMetaData importSheetMetaData = importSheets.get(0);

        assertEquals(8, importMetaData.getNonCalculatedFields().getFieldsFor(importSheetMetaData).size());
        assertEquals(3, importMetaData.getCalculatedFields().getFieldsFor(importSheetMetaData).size());
        List<ImportField> defaultFields = importSheetMetaData.getDefaultFields();
        assertEquals(4, defaultFields.size());
        assertEquals(15, importMetaData.getAllFields(importSheetMetaData).size());

        ImportDefaultField importField = (ImportDefaultField) defaultFields.get(1);
        assertEquals(importField.getSystemFieldName(), "Registration Date");
        assertEquals(importField.getDefaultValue(), new LocalDate(2017, 7, 24).toDate());

        importSheetMetaData = importSheets.get(1);
        assertEquals(1, importMetaData.getNonCalculatedFields().getFieldsFor(importSheetMetaData).size());
        assertEquals(0, importMetaData.getCalculatedFields().getFieldsFor(importSheetMetaData).size());

        importSheetMetaData = importSheets.get(9);
        assertEquals(1, importMetaData.getCalculatedFields().getFieldsFor(importSheetMetaData).size());
        assertEquals(1, importSheetMetaData.getDefaultFields().size());

        ImportAnswerMetaDataList answerMetaDataList = importMetaData.getAnswerMetaDataList();
        assertEquals("Yes", answerMetaDataList.getSystemAnswer("Continued", "School going"));
        assertEquals("Yes", answerMetaDataList.getSystemAnswer("Continued", "Something else"));
    }

    @Test
    public void getRequestFromImportSheet() throws IOException {
        Map<String, UUID> answers = new HashMap<>();
        UUID yes = UUID.randomUUID();
        answers.put("Yes", yes);
        answers.put("Dropped out", UUID.randomUUID());
        when(conceptRepository.findByName("School going")).thenReturn(TestEntityFactory.createCodedConcept("School going", answers));
        when(conceptRepository.findByName("Yes")).thenReturn(TestEntityFactory.createConceptOfNotType(yes.toString(), "Yes"));

        ImportFile importFile = new ImportFile(new ClassPathResource("Test Import.xlsx").getInputStream());
        Map<ImportSheetMetaData, List<CHSRequest>> requestMap = new HashMap<>();

        importMetaData.getImportSheets().forEach(sheetMetaData -> {
            List<ImportField> allFields = importMetaData.getAllFields(sheetMetaData);
            ImportSheet importSheet = importFile.getSheet(sheetMetaData.getSheetName());
            int numberOfDataRows = importSheet.getNumberOfDataRows();
            for (int i = 0; i < numberOfDataRows; i++) {
                CHSRequest request = importSheet.getRequest(allFields, sheetMetaData, i, conceptRepository, formElementRepository, importMetaData.getAnswerMetaDataList());
                List<CHSRequest> chsRequests = requestMap.computeIfAbsent(sheetMetaData, k -> new ArrayList<>());
                chsRequests.add(request);
            }
        });
        assertEquals(requestMap.get(new ImportSheetMetaData("Test Import", "Amalzar_Madhyamik_24-7", Individual.class)).size(), 5);
        assertEquals(requestMap.get(new ImportSheetMetaData("Test Import", "Amalzar_Madhyamik_24-7", ProgramEnrolment.class)).size(), 5);
        assertEquals(requestMap.get(new ImportSheetMetaData("Test Import", "Amalzar_Madhyamik_24-7", ProgramEncounter.class)).size(), 5);
        assertEquals(requestMap.get(new ImportSheetMetaData("Test Import", "Amalzar_Prathmik_3-8", Individual.class)).size(), 5);
        assertEquals(requestMap.get(new ImportSheetMetaData("Test Import", "Amalzar_Prathmik_3-8", ProgramEnrolment.class)).size(), 5);
        assertEquals(requestMap.get(new ImportSheetMetaData("Test Import", "Amalzar_Prathmik_3-8", ProgramEncounter.class)).size(), 5);
        assertEquals(requestMap.get(new ImportSheetMetaData("Test Import", "Madhyamik_Follow up_26-9", Individual.class)), null);
        assertEquals(requestMap.get(new ImportSheetMetaData("Test Import", "Madhyamik_Follow up_26-9", ProgramEnrolment.class)), null);
        assertEquals(requestMap.get(new ImportSheetMetaData("Test Import", "Madhyamik_Follow up_26-9", ProgramEncounter.class)).size(), 6);
        assertEquals(requestMap.get(new ImportSheetMetaData("Test Import", "ambos 3-10", Individual.class)).size(), 7);
        assertEquals(requestMap.get(new ImportSheetMetaData("Test Import", "ambos 3-10", ProgramEnrolment.class)).size(), 7);
        assertEquals(requestMap.get(new ImportSheetMetaData("Test Import", "ambos 3-10", ProgramEncounter.class)).size(), 7);

        List<CHSRequest> individualsAmalzarMadhyamik = requestMap.get(new ImportSheetMetaData("Test Import", "Amalzar_Madhyamik_24-7", Individual.class));
        IndividualRequest individualAmalzarMadhyamik = (IndividualRequest) individualsAmalzarMadhyamik.get(0);
        assertEquals(individualAmalzarMadhyamik.getRegistrationDate(), new LocalDate(2017, 7, 24));
        assertEquals(individualAmalzarMadhyamik.getFirstName(), "Aarti Mangabhai");
        assertEquals(individualAmalzarMadhyamik.getLastName(), "Vasava");
        assertEquals(individualAmalzarMadhyamik.getDateOfBirth(), new LocalDate(2003, 6, 6));
        assertEquals(individualAmalzarMadhyamik.isDateOfBirthVerified(), true);
        assertEquals(individualAmalzarMadhyamik.getGender(), "Female");
        assertEquals(individualAmalzarMadhyamik.getObservationValue("Village"), "Aamlzar");
        assertEquals(individualAmalzarMadhyamik.getObservationValue("Mother's Name"), "Vanitaben");
        assertEquals(individualAmalzarMadhyamik.findObservation("Height"), null);

        List<CHSRequest> enrolmentsAmalzarMadhyamik = requestMap.get(new ImportSheetMetaData("Test Import", "Amalzar_Madhyamik_24-7", ProgramEnrolment.class));
        ProgramEnrolmentRequest enrolmentAmalzarMadhyamik = (ProgramEnrolmentRequest) enrolmentsAmalzarMadhyamik.get(1);
        assertEquals(enrolmentAmalzarMadhyamik.getEnrolmentDateTime().toLocalDate(), new LocalDate(2017, 7, 24));
        String schoolGoing = (String) enrolmentAmalzarMadhyamik.getObservationValue("School going");
        assertEquals(schoolGoing, answers.get("Yes").toString());

        List<CHSRequest> encountersAmalzarMadhyamik = requestMap.get(new ImportSheetMetaData("Test Import", "Amalzar_Madhyamik_24-7", ProgramEncounter.class));
        ProgramEncounterRequest encounterAmalzarMadhyamik = (ProgramEncounterRequest) encountersAmalzarMadhyamik.get(0);
        //Father's occupation when none
    }
}