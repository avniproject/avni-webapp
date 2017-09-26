package org.openchs.excel;

import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.openchs.dao.ConceptRepository;
import org.openchs.dao.IndividualRepository;
import org.openchs.healthmodule.adapter.HealthModuleInvokerFactory;
import org.openchs.importer.Importer;
import org.openchs.service.ChecklistService;
import org.openchs.web.*;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.transaction.Transactional;
import java.io.File;
import java.io.InputStream;
import java.text.ParseException;
import java.util.Iterator;

@Component
public class ExcelImporter implements Importer {
    private IndividualController individualController;
    private ProgramEnrolmentController programEnrolmentController;
    private ProgramEncounterController programEncounterController;
    private IndividualRepository individualRepository;
    private ChecklistController checklistController;
    private ChecklistItemController checklistItemController;
    private ConceptRepository conceptRepository;
    private ChecklistService checklistService;
    private final org.slf4j.Logger logger;

    @Autowired
    public ExcelImporter(IndividualController individualController, ProgramEnrolmentController programEnrolmentController, ProgramEncounterController programEncounterController, IndividualRepository individualRepository, ChecklistController checklistController, ChecklistItemController checklistItemController, ConceptRepository conceptRepository, ChecklistService checklistService) {
        this.individualController = individualController;
        this.programEnrolmentController = programEnrolmentController;
        this.programEncounterController = programEncounterController;
        this.individualRepository = individualRepository;
        this.checklistController = checklistController;
        this.checklistItemController = checklistItemController;
        this.conceptRepository = conceptRepository;
        this.checklistService = checklistService;
        this.logger = LoggerFactory.getLogger(this.getClass());
    }

    @Transactional(Transactional.TxType.REQUIRED)
    public void rowImport(Row row, ContentType contentType, RowProcessor rowProcessor, String programName, HealthModuleInvokerFactory healthModuleInvokerFactory) throws ParseException {
        if (contentType == ContentType.RegistrationHeader) {
            rowProcessor.readRegistrationHeader(row);
        } else if (contentType == ContentType.Registration) {
            rowProcessor.processIndividual(row);
        } else if (contentType == ContentType.EnrolmentHeader) {
            rowProcessor.readEnrolmentHeader(row);
        } else if (contentType == ContentType.Enrolment) {
            rowProcessor.processEnrolment(row, programName, healthModuleInvokerFactory.getProgramEnrolmentInvoker());
        } else if (contentType == ContentType.ProgramEncounterHeader) {
            rowProcessor.readProgramEncounterHeader(row);
        } else if (contentType == ContentType.ProgramEncounter) {
            rowProcessor.processProgramEncounter(row);
        } else if (contentType == ContentType.ChecklistHeader) {
            rowProcessor.readChecklistHeader(row);
        } else if (contentType == ContentType.Checklist) {
            rowProcessor.processChecklist(row);
        }
    }

    @Override
    public Boolean importData(InputStream inputStream) throws Exception {
        HealthModuleInvokerFactory healthModuleInvokerFactory = new HealthModuleInvokerFactory(new File("external"));
        Boolean returnValue = true;
        XSSFWorkbook workbook = new XSSFWorkbook(inputStream);
        try {
            for (int i = 0; i < workbook.getNumberOfSheets(); i++) {
                XSSFSheet sheet = workbook.getSheetAt(i);
                ContentTypeSequence contentTypeSequence = new ContentTypeSequence();

                logger.info("READING SHEET: ", sheet.getSheetName());
                RowProcessor rowProcessor = new RowProcessor(individualController, programEnrolmentController, programEncounterController, individualRepository, checklistController, checklistItemController, checklistService, conceptRepository);
                Iterator<Row> iterator = sheet.iterator();
                ContentType contentType = null;
                String programName = sheet.getSheetName();
                while (iterator.hasNext()) {
                    Row row = iterator.next();
                    String firstCellTextInGroup = ExcelUtil.getText(row, 0);
                    contentType = contentTypeSequence.getNextType(contentType, firstCellTextInGroup);
                    this.rowImport(row, contentType, rowProcessor, programName, healthModuleInvokerFactory);
                }
                logger.info("COMPLETED SHEET: ", sheet.getSheetName());
            }
        } catch (Exception error) {
            returnValue = false;
            logger.error(error.getMessage(), error);
            throw error;
        } finally {
            workbook.close();
            inputStream.close();
            return returnValue;
        }
    }
}