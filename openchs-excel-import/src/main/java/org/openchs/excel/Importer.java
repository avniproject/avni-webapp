package org.openchs.excel;

import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.openchs.dao.ConceptRepository;
import org.openchs.dao.IndividualRepository;
import org.openchs.healthmodule.adapter.HealthModuleInvokerFactory;
import org.openchs.service.ChecklistService;
import org.openchs.web.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.FileInputStream;
import java.text.ParseException;
import java.util.Iterator;

@Component
public class Importer implements CommandLineRunner {
    private IndividualController individualController;
    private ProgramEnrolmentController programEnrolmentController;
    private ProgramEncounterController programEncounterController;
    private IndividualRepository individualRepository;
    private ChecklistController checklistController;
    private ChecklistItemController checklistItemController;
    private ConceptRepository conceptRepository;
    private ChecklistService checklistService;

    @Autowired
    public Importer(IndividualController individualController, ProgramEnrolmentController programEnrolmentController, ProgramEncounterController programEncounterController, IndividualRepository individualRepository, ChecklistController checklistController, ChecklistItemController checklistItemController, ConceptRepository conceptRepository, ChecklistService checklistService) {
        this.individualController = individualController;
        this.programEnrolmentController = programEnrolmentController;
        this.programEncounterController = programEncounterController;
        this.individualRepository = individualRepository;
        this.checklistController = checklistController;
        this.checklistItemController = checklistItemController;
        this.conceptRepository = conceptRepository;
        this.checklistService = checklistService;
    }

    private static void rowImport(Row row, ContentType contentType, RowProcessor rowProcessor, String programName, HealthModuleInvokerFactory healthModuleInvokerFactory) throws ParseException {
        if (contentType == ContentType.RegistrationHeader) {
            rowProcessor.readRegistrationHeader(row);
        } else if (contentType == ContentType.Registration) {
            rowProcessor.processRegistration(row);
        } else if (contentType == ContentType.EnrolmentHeader) {
            rowProcessor.readEnrolmentHeader(row);
        } else if (contentType == ContentType.Enrolment) {
            rowProcessor.processEnrolment(row, programName, healthModuleInvokerFactory.getProgramEnrolmentInvoker());
        } else if (contentType == ContentType.ProgramEncounterHeader) {
            rowProcessor.readProgramEncounterHeader(row);
        } else if (contentType == ContentType.ProgramEncounter) {
            rowProcessor.processProgramEncounter(row);
        }
    }

    public void run(String... strings) throws Exception {
        HealthModuleInvokerFactory healthModuleInvokerFactory = new HealthModuleInvokerFactory(new File("external"));
        FileInputStream inputStream = new FileInputStream(new File("input/TransactionData.xlsx"));
        XSSFWorkbook workbook = new XSSFWorkbook(inputStream);
        try {
            for (int i = 0; i < workbook.getNumberOfSheets(); i++) {
                XSSFSheet sheet = workbook.getSheetAt(i);
                ContentTypeSequence contentTypeSequence = new ContentTypeSequence();

                System.out.println("READING SHEET: " + sheet.getSheetName());

                RowProcessor rowProcessor = new RowProcessor(individualController, programEnrolmentController, programEncounterController, individualRepository, checklistController, checklistItemController, checklistService, conceptRepository);
                Iterator<Row> iterator = sheet.iterator();
                ContentType contentType = null;
                String programName = sheet.getSheetName();
                while (iterator.hasNext()) {
                    Row row = iterator.next();
                    String firstCellTextInGroup = ExcelUtil.getText(row, 0);
                    contentType = contentTypeSequence.getNextType(contentType, firstCellTextInGroup);
                    Importer.rowImport(row, contentType, rowProcessor, programName, healthModuleInvokerFactory);
                }
                System.out.println("COMPLETED SHEET: " + sheet.getSheetName());
            }
        } finally {
            workbook.close();
            inputStream.close();
        }
    }
}