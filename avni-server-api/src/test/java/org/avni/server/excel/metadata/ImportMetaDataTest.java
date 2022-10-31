package org.avni.server.excel.metadata;

import org.avni.server.dao.*;
import org.avni.server.domain.*;
import org.avni.server.excel.metadata.*;
import org.avni.server.importer.*;
import org.joda.time.LocalDate;
import org.junit.Before;
import org.junit.Test;
import org.mockito.Mock;
import org.avni.server.application.FormElement;
import org.avni.server.dao.application.FormElementRepository;
import org.avni.server.dao.individualRelationship.IndividualRelationshipTypeRepository;
import org.avni.server.excel.reader.ImportMetaDataExcelReader;
import org.avni.server.service.OldDataImportService;
import org.avni.server.web.ChecklistController;
import org.avni.server.web.ChecklistItemController;
import org.avni.server.web.IndividualRelationshipController;
import org.avni.server.web.request.CHSRequest;
import org.avni.server.web.request.IndividualRequest;
import org.avni.server.web.request.ProgramEncounterRequest;
import org.avni.server.web.request.ProgramEnrolmentRequest;
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
    private ChecklistItemRepository checklistItemRepository;
    @Mock
    private ChecklistRepository checklistRepository;
    @Mock
    private ChecklistDetailRepository checklistDetailRepository;
    @Mock
    private ChecklistItemDetailRepository checklistItemDetailRepository;
    @Mock
    private UserRepository userRepository;

    @Mock
    private ChecklistController checklistController;

    @Mock
    private ChecklistItemController checklistItemController;

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
        when(conceptRepository.findByNameIgnoreCase(anyString())).thenReturn(placeHolderConcept);
        when(formElementRepository.findFirstByConcept(any(Concept.class))).thenReturn(placeHolderFormElement);
        metaDataInputStream = new ClassPathResource("Import MetaData.xlsx").getInputStream();
    }

    @Test
    public void readMetaData() throws IOException {
        ImportMetaData importMetaData = ImportMetaDataExcelReader.readMetaData(metaDataInputStream);
        ImportSheetMetaDataList importSheets = importMetaData.getImportSheets();
        ImportSheetMetaData importSheetMetaData = importSheets.get(0);

        assertEquals(9, importMetaData.getNonCalculatedFields().getFieldsFor(importSheetMetaData).size());
        assertEquals(3, importMetaData.getCalculatedFields().getFieldsFor(importSheetMetaData).size());
        List<ImportField> defaultFields = importSheetMetaData.getDefaultFields();
        assertEquals(4, defaultFields.size());
        assertEquals(16, importMetaData.getAllFields(importSheetMetaData).size());

        ImportDefaultField importField = (ImportDefaultField) defaultFields.get(1);
        assertEquals(importField.getSystemFieldName(), "Registration Date");
        assertEquals(importField.getDefaultValue(), new LocalDate(2017, 7, 24).toDate());

        importSheetMetaData = importSheets.get(1);
        assertEquals(3, importMetaData.getNonCalculatedFields().getFieldsFor(importSheetMetaData).size());
        assertEquals(0, importMetaData.getCalculatedFields().getFieldsFor(importSheetMetaData).size());

        importSheetMetaData = importSheets.get(9);
        assertEquals(0, importMetaData.getCalculatedFields().getFieldsFor(importSheetMetaData).size());
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
        when(conceptRepository.findByNameIgnoreCase("Yes")).thenReturn(TestEntityFactory.createConceptOfNotType(yes.toString(), "Yes"));

        IndividualImporter individualImporter = new IndividualImporter(conceptRepository, formElementRepository, null, userRepository);
        EncounterImporter encounterImporter = new EncounterImporter(conceptRepository, formElementRepository, null, userRepository);
        ProgramEnrolmentImporter programEnrolmentImporter = new ProgramEnrolmentImporter(conceptRepository, formElementRepository, null, userRepository);
        ProgramEncounterImporter programEncounterImporter = new ProgramEncounterImporter(conceptRepository, formElementRepository, null, null, userRepository);
        ChecklistImporter checklistImporter = new ChecklistImporter(conceptRepository, formElementRepository, checklistDetailRepository, checklistItemDetailRepository, checklistRepository, checklistController, checklistItemController, null, userRepository);
        IndividualRelationshipImporter individualRelationshipImporter = new IndividualRelationshipImporter(conceptRepository, formElementRepository, individualRelationshipTypeRepository, individualRelationshipController, userRepository);
        OldDataImportService oldDataImportService = new OldDataImportService(individualImporter, encounterImporter, programEnrolmentImporter, programEncounterImporter, checklistImporter, individualRelationshipImporter);
        String fileName = "Test Import";
        Map<ImportSheetMetaData, List<CHSRequest>> requestMap = oldDataImportService.importExcel(metaDataInputStream, new ClassPathResource(fileName + ".xlsx").getInputStream(), fileName, false, null, null);

        assertEquals(requestMap.get(new ImportSheetMetaData("Test Import", "Amalzar_Madhyamik_24-7", Individual.class)).size(), 5);
        assertEquals(requestMap.get(new ImportSheetMetaData("Test Import", "Amalzar_Madhyamik_24-7", ProgramEnrolment.class)).size(), 5);
        assertEquals(requestMap.get(new ImportSheetMetaData("Test Import", "Amalzar_Madhyamik_24-7", ProgramEncounter.class)).size(), 5);
        assertEquals(requestMap.get(new ImportSheetMetaData("Test Import", "Amalzar_Prathmik_3-8", Individual.class)).size(), 5);
        assertEquals(requestMap.get(new ImportSheetMetaData("Test Import", "Amalzar_Prathmik_3-8", ProgramEnrolment.class)).size(), 5);
        assertEquals(requestMap.get(new ImportSheetMetaData("Test Import", "Amalzar_Prathmik_3-8", ProgramEncounter.class)).size(), 5);
        assertEquals(requestMap.get(new ImportSheetMetaData("Test Import", "Madhyamik_Follow up_26-9", Individual.class)), null);
        assertEquals(requestMap.get(new ImportSheetMetaData("Test Import", "Madhyamik_Follow up_26-9", ProgramEnrolment.class)), null);
        assertEquals(requestMap.get(new ImportSheetMetaData("Test Import", "Madhyamik_Follow up_26-9", ProgramEncounter.class)).size(), 5);
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
        createSheetMetaData(importSheetMetaDataList, "File type 1");
        importMetaData.setImportSheets(importSheetMetaDataList);

        ImportCalculatedFields calculatedFields = new ImportCalculatedFields();
        createCalculatedField(calculatedFields, "File type 1");
        createCalculatedField(calculatedFields, "File type 2");
        importMetaData.setCalculatedFields(calculatedFields);

        ImportNonCalculatedFields nonCalculatedFields = new ImportNonCalculatedFields();
        ImportNonCalculatedField nonCalculatedField1 = createNonCalculatedField(nonCalculatedFields,"File type 1");
        ImportNonCalculatedField nonCalculatedField2 = createNonCalculatedField(nonCalculatedFields,"File type 2");
        nonCalculatedFields.addUserField("field1", nonCalculatedField1);
        importMetaData.setNonCalculatedFields(nonCalculatedFields);

        List compilationErrors = importMetaData.compile();
        assertEquals(2, compilationErrors.size());

        createSheetMetaData(importSheetMetaDataList, "File type 2");
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
        nonCalculatedField.setUserFileType(userFileType);
        nonCalculatedFields.add(nonCalculatedField);
        return nonCalculatedField;
    }

    private void createSheetMetaData(ImportSheetMetaDataList importSheetMetaDataList, String userFileType) {
        ImportSheetMetaData importSheetMetaData = new ImportSheetMetaData();
        importSheetMetaData.setUserFileType(userFileType);
        importSheetMetaDataList.add(importSheetMetaData);
    }
}
