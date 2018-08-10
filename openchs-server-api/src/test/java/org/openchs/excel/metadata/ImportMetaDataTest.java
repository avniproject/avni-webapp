package org.openchs.excel.metadata;

import org.joda.time.LocalDate;
import org.junit.Before;
import org.junit.Test;
import org.mockito.Mock;
import org.openchs.application.FormElement;
import org.openchs.dao.ConceptRepository;
import org.openchs.dao.application.FormElementRepository;
import org.openchs.dao.individualRelationship.IndividualRelationshipRepository;
import org.openchs.dao.individualRelationship.IndividualRelationshipTypeRepository;
import org.openchs.domain.*;
import org.openchs.excel.reader.ImportMetaDataExcelReader;
import org.openchs.importer.*;
import org.openchs.service.DataImportService;
import org.openchs.web.IndividualRelationshipController;
import org.openchs.web.request.CHSRequest;
import org.openchs.web.request.IndividualRequest;
import org.openchs.web.request.ProgramEncounterRequest;
import org.openchs.web.request.ProgramEnrolmentRequest;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;
import java.io.InputStream;
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
    private InputStream metaDataInputStream;

    @Mock
    private IndividualRelationshipTypeRepository individualRelationshipTypeRepository;
    @Mock
    private IndividualRelationshipController individualRelationshipController;

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
        metaDataInputStream = new ClassPathResource("Import MetaData.xlsx").getInputStream();
    }

    @Test
    public void readMetaData() throws IOException {
        ImportMetaData importMetaData = ImportMetaDataExcelReader.readMetaData(metaDataInputStream);
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
    public void getRequestFromImportSheet() throws IOException, InterruptedException {
        Map<String, UUID> answers = new HashMap<>();
        UUID yes = UUID.randomUUID();
        answers.put("Yes", yes);
        answers.put("Dropped out", UUID.randomUUID());
        when(conceptRepository.findByName("School going")).thenReturn(TestEntityFactory.createCodedConcept("School going", answers));
        when(conceptRepository.findByName("Yes")).thenReturn(TestEntityFactory.createConceptOfNotType(yes.toString(), "Yes"));

        IndividualImporter individualImporter = new IndividualImporter(conceptRepository, formElementRepository, null);
        EncounterImporter encounterImporter = new EncounterImporter(conceptRepository, formElementRepository, null);
        ProgramEnrolmentImporter programEnrolmentImporter = new ProgramEnrolmentImporter(conceptRepository, formElementRepository, null);
        ProgramEncounterImporter programEncounterImporter = new ProgramEncounterImporter(conceptRepository, formElementRepository, null, null);
        ChecklistImporter checklistImporter = new ChecklistImporter(conceptRepository, formElementRepository);
        IndividualRelationshipImporter individualRelationshipImporter = new IndividualRelationshipImporter(conceptRepository, formElementRepository, individualRelationshipTypeRepository, individualRelationshipController);
        DataImportService dataImportService = new DataImportService(individualImporter, encounterImporter, programEnrolmentImporter, programEncounterImporter, checklistImporter, individualRelationshipImporter);
        Map<ImportSheetMetaData, List<CHSRequest>> requestMap = dataImportService.importExcel(metaDataInputStream, new ClassPathResource("Test Import.xlsx").getInputStream(), false);

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

    @Test
    public void userFileTypeNamesShouldMatch() {
        ImportMetaData importMetaData = new ImportMetaData();
        ImportSheetMetaDataList importSheetMetaDataList = new ImportSheetMetaDataList();
        createSheetMetaData(importSheetMetaDataList,"File type 1");
        importMetaData.setImportSheets(importSheetMetaDataList);

        ImportCalculatedFields calculatedFields = new ImportCalculatedFields();
        createCalculatedField(calculatedFields, "File type 1");
        createCalculatedField(calculatedFields, "File type 2");
        importMetaData.setCalculatedFields(calculatedFields);

        ImportNonCalculatedFields nonCalculatedFields = new ImportNonCalculatedFields();
        nonCalculatedFields.addFileType(0, "File type 1");
        nonCalculatedFields.addFileType(1, "File type 2");
        ImportNonCalculatedField nonCalculatedField1 = createNonCalculatedField(nonCalculatedFields, "File type 1");
        ImportNonCalculatedField nonCalculatedField2 = createNonCalculatedField(nonCalculatedFields, "File type 2");
        nonCalculatedFields.addUserField(0, "field1", nonCalculatedField1);
        importMetaData.setNonCalculatedFields(nonCalculatedFields);

        List compilationErrors = importMetaData.compile();
        assertEquals(3, compilationErrors.size());

        createSheetMetaData(importSheetMetaDataList,"File type 2");
        compilationErrors = importMetaData.compile();
        assertEquals(1, compilationErrors.size());

        nonCalculatedFields.addUserField(1, "field2", nonCalculatedField2);
        compilationErrors = importMetaData.compile();
        assertEquals(0, compilationErrors.size());
    }

    private void createCalculatedField(ImportCalculatedFields calculatedFields, String userFileType) {
        ImportCalculatedField calculatedField = new ImportCalculatedField();
        calculatedField.setUserFileType(userFileType);
        calculatedFields.add(calculatedField);
    }

    private ImportNonCalculatedField createNonCalculatedField(ImportNonCalculatedFields nonCalculatedFields, String userFileType) {
        ImportNonCalculatedField nonCalculatedField = new ImportNonCalculatedField();
        nonCalculatedField.setImportUserFileType(userFileType);
        nonCalculatedFields.add(nonCalculatedField);
        return nonCalculatedField;
    }

    private void createSheetMetaData(ImportSheetMetaDataList importSheetMetaDataList, String userFileType) {
        ImportSheetMetaData importSheetMetaData = new ImportSheetMetaData();
        importSheetMetaData.setUserFileType(userFileType);
        importSheetMetaDataList.add(importSheetMetaData);
    }
}