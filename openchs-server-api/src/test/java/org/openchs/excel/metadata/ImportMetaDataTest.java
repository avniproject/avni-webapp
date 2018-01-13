package org.openchs.excel.metadata;

import org.joda.time.LocalDate;
import org.junit.Before;
import org.junit.Test;
import org.mockito.Mock;
import org.openchs.dao.ConceptRepository;
import org.openchs.dao.OrganisationRepository;
import org.openchs.domain.Concept;
import org.openchs.domain.Individual;
import org.openchs.domain.ProgramEncounter;
import org.openchs.domain.ProgramEnrolment;
import org.openchs.excel.data.ImportFile;
import org.openchs.excel.data.ImportSheet;
import org.openchs.excel.reader.ImportMetaDataExcelReader;
import org.openchs.web.request.CHSRequest;
import org.openchs.web.request.IndividualRequest;
import org.openchs.web.request.ObservationRequest;
import org.openchs.web.request.ProgramEnrolmentRequest;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static org.junit.Assert.assertEquals;
import static org.mockito.Matchers.anyString;
import static org.mockito.Mockito.when;
import static org.mockito.MockitoAnnotations.initMocks;

public class ImportMetaDataTest {
    @Mock
    private ConceptRepository conceptRepository;
    private ImportMetaData importMetaData;

    @Before
    public void setup() throws IOException {
        initMocks(this);
        when(conceptRepository.findByName(anyString())).thenReturn(new Concept());
        importMetaData = ImportMetaDataExcelReader.readMetaData(new ClassPathResource("Import MetaData.xlsx").getInputStream());
    }

    @Test
    public void readMetaData() throws IOException {
        ImportSheetMetaDataList importSheets = importMetaData.getImportSheets();
        ImportSheetMetaData importSheetMetaData = importSheets.get(0);

        assertEquals(9, importMetaData.getNonCalculatedFields().getFieldsFor(importSheetMetaData).size());
        assertEquals(3, importMetaData.getCalculatedFields().getFieldsFor(importSheetMetaData).size());
        List<ImportField> defaultFields = importSheetMetaData.getDefaultFields();
        assertEquals(2, defaultFields.size());
        assertEquals(14, importMetaData.getAllFields(importSheetMetaData).size());

        ImportDefaultField importField = (ImportDefaultField) defaultFields.get(0);
        assertEquals(importField.getSystemFieldName(), "Registration Date");
        assertEquals(importField.getDefaultValue(), "24-Jul-2017");
    }

    @Test
    public void getRequestFromImportSheet() throws IOException {
        ImportFile importFile = new ImportFile(new ClassPathResource("Test Import.xlsx").getInputStream());
        Map<ImportSheetMetaData, List<CHSRequest>> requestMap = new HashMap<>();

        importMetaData.getImportSheets().forEach(sheetMetaData -> {
            List<ImportField> allFields = importMetaData.getAllFields(sheetMetaData);
            ImportSheet importSheet = importFile.getSheet(sheetMetaData.getSheetName());
            int numberOfDataRows = importSheet.getNumberOfDataRows();
            for (int i = 0; i < numberOfDataRows; i++) {
                CHSRequest request = importSheet.getRequest(allFields, sheetMetaData, i, conceptRepository);
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
        assertEquals(enrolmentAmalzarMadhyamik.getObservationValue("School going"), "Continued");
    }

    @Test
    public void regex() {
        System.out.println(find("Twinkalben Vikrambhai vsava  - 7", "[a-zA-Z]+\\s+[a-zA-Z]+"));
        System.out.println(find("Twinkalben Vikrambhai vsava  - 7", "[a-zA-Z]+\\s+[a-zA-Z]+\\s+([a-zA-Z]+).*"));
        System.out.println(find("Twinkalben Vikrambhai vsava  - 7", "[a-zA-Z]+\\s+([a-zA-Z]+).*"));
        System.out.println(find("Twinkalben Vikrambhai vsava  - 7", ".*(\\d).*"));
        System.out.println(find("Twinkalben Vikrambhai vsava  -7", ".*(\\d).*"));
        System.out.println(find("Twinkalben Vikrambhai vsava", ".*(\\d).*"));
    }

    private String find(String string, String regex) {
        try {
            Pattern fullNamePattern = Pattern.compile(regex);
            Matcher matcher = fullNamePattern.matcher(string);
            matcher.find();
            return matcher.group(matcher.groupCount());
        } catch (Exception e) {
            return null;
        }
    }
}