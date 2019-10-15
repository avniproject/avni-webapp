package org.openchs.web;

import com.fasterxml.jackson.core.PrettyPrinter;
import com.fasterxml.jackson.core.util.DefaultPrettyPrinter;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.openchs.application.Form;
import org.openchs.application.FormMapping;
import org.openchs.dao.*;
import org.openchs.dao.application.FormMappingRepository;
import org.openchs.dao.application.FormRepository;
import org.openchs.domain.*;
import org.openchs.framework.security.UserContextHolder;
import org.openchs.util.ObjectMapperSingleton;
import org.openchs.web.request.*;
import org.openchs.web.request.application.FormContract;
import org.openchs.web.request.webapp.CatchmentExport;
import org.openchs.web.request.webapp.CatchmentsExport;
import org.openchs.web.request.webapp.ConceptExport;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@RestController
public class ImplementationController implements RestControllerResourceProcessor<Concept> {
    private ConceptRepository conceptRepository;
    private final FormRepository formRepository;
    private final AddressLevelTypeRepository addressLevelTypeRepository;
    private final LocationRepository locationRepository;
    private final CatchmentRepository catchmentRepository;
    private final SubjectTypeRepository subjectTypeRepository;
    private final OperationalSubjectTypeRepository operationalSubjectTypeRepository;
    private final OperationalEncounterTypeRepository operationalEncounterTypeRepository;
    private final EncounterTypeRepository encounterTypeRepository;
    private final ProgramRepository programRepository;
    private final OperationalProgramRepository operationalProgramRepository;
    private final FormMappingRepository formMappingRepository;
    private ObjectMapper objectMapper;

    @Autowired
    public ImplementationController(ConceptRepository conceptRepository,
                                    FormRepository formRepository,
                                    AddressLevelTypeRepository addressLevelTypeRepository,
                                    LocationRepository locationRepository,
                                    CatchmentRepository catchmentRepository,
                                    SubjectTypeRepository subjectTypeRepository,
                                    OperationalSubjectTypeRepository operationalSubjectTypeRepository,
                                    OperationalEncounterTypeRepository operationalEncounterTypeRepository,
                                    EncounterTypeRepository encounterTypeRepository,
                                    ProgramRepository programRepository,
                                    OperationalProgramRepository operationalProgramRepository,
                                    FormMappingRepository formMappingRepository) {
        this.conceptRepository = conceptRepository;
        this.formRepository = formRepository;
        this.addressLevelTypeRepository = addressLevelTypeRepository;
        this.locationRepository = locationRepository;
        this.catchmentRepository = catchmentRepository;
        this.subjectTypeRepository = subjectTypeRepository;
        this.operationalSubjectTypeRepository = operationalSubjectTypeRepository;
        this.operationalEncounterTypeRepository = operationalEncounterTypeRepository;
        this.encounterTypeRepository = encounterTypeRepository;
        this.programRepository = programRepository;
        this.operationalProgramRepository = operationalProgramRepository;
        this.formMappingRepository = formMappingRepository;
        objectMapper = ObjectMapperSingleton.getObjectMapper();
    }

    @RequestMapping(value = "/implementation/export", method = RequestMethod.GET)
    @PreAuthorize("hasAnyAuthority('admin','organisation_admin')")
    public ResponseEntity<ByteArrayResource> export() throws IOException {

        Organisation organisation = UserContextHolder.getUserContext().getOrganisation();
        Long orgId = organisation.getId();

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        //ZipOutputStream will be automatically closed because we are using try-with-resources.
        try (ZipOutputStream zos = new ZipOutputStream(baos)) {
            addAddressLevelTypesJson(orgId, zos);
            addAddressLevelsJson(orgId, zos);
            addCatchmentsJson(organisation, zos);
            addSubjectTypesJson(orgId, zos);
            addOperationalSubjectTypesJson(organisation, zos);
            addEncounterTypesJson(organisation, zos);
            addOperationalEncounterTypesJson(organisation, zos);
            addProgramsJson(organisation, zos);
            addOperationalProgramsJson(organisation, zos);
            addConceptsJson(orgId, zos);
            addFormsJson(orgId, zos);
            addFormMappingsJson(orgId, zos);
        }

        byte[] baosByteArray = baos.toByteArray();

        return ResponseEntity.ok()
                .headers(getHttpHeaders())
                .contentLength(baosByteArray.length)
                .contentType(MediaType.parseMediaType("application/octet-stream"))
                .body(new ByteArrayResource(baosByteArray));

    }

    private void addFormMappingsJson(Long orgId, ZipOutputStream zos) throws IOException {
        List<FormMapping> formMappings = formMappingRepository.findAllByOrganisationId(orgId);
        List<FormMappingContract> contracts = formMappings.stream()
                .map(FormMappingContract::fromFormMapping)
                .collect(Collectors.toList());
        addFileToZip(zos, "formMappings.json", contracts);
    }

    private void addOperationalProgramsJson(Organisation organisation, ZipOutputStream zos) throws IOException {
        List<OperationalProgram> operationalPrograms = operationalProgramRepository
                .findAllByOrganisationId(organisation.getId());
        List<OperationalProgramContract> contracts = operationalPrograms.stream()
                .map(OperationalProgramContract::fromOperationalProgram)
                .collect(Collectors.toList());
        OperationalProgramsContract operationalProgramsContract = new OperationalProgramsContract();
        operationalProgramsContract.setOrganisationName(organisation.getName());
        operationalProgramsContract.setOperationalPrograms(contracts);
        addFileToZip(zos, "operationalPrograms.json", operationalProgramsContract);
    }

    private void addProgramsJson(Organisation organisation, ZipOutputStream zos) throws IOException {
        List<Program> programs = programRepository.findAllByOrganisationId(organisation.getId());
        List<ProgramRequest> contracts = programs.stream().map(ProgramRequest::fromProgram)
                .collect(Collectors.toList());
        addFileToZip(zos, "programs.json", contracts);
    }

    private void addOperationalEncounterTypesJson(Organisation organisation, ZipOutputStream zos) throws IOException {
        List<OperationalEncounterType> operationalEncounterTypes = operationalEncounterTypeRepository
                .findAllByOrganisationId(organisation.getId());
        List<OperationalEncounterTypeContract> contracts = operationalEncounterTypes.stream()
                .map(OperationalEncounterTypeContract::fromOperationalEncounterType)
                .collect(Collectors.toList());
        OperationalEncounterTypesContract operationalEncounterTypesContract = new OperationalEncounterTypesContract();
        operationalEncounterTypesContract.setOrganisationName(organisation.getName());
        operationalEncounterTypesContract.setOperationalEncounterTypes(contracts);
        addFileToZip(zos, "operationalEncounterTypes.json", operationalEncounterTypesContract);
    }

    private void addEncounterTypesJson(Organisation organisation, ZipOutputStream zos) throws IOException {
        List<EncounterType> encounterTypes = encounterTypeRepository.findAllByOrganisationId(organisation.getId());
        List<EncounterTypeContract> contracts = encounterTypes.stream().map(EncounterTypeContract::fromEncounterType)
                .collect(Collectors.toList());
        addFileToZip(zos, "encounterTypes.json", contracts);
    }

    private void addOperationalSubjectTypesJson(Organisation org, ZipOutputStream zos) throws IOException {
        List<OperationalSubjectType> operationalSubjectTypes = operationalSubjectTypeRepository
                .findAllByOrganisationId(org.getId());
        List<OperationalSubjectTypeContract> operationalSubjectTypeContracts = operationalSubjectTypes.stream()
                .map(OperationalSubjectTypeContract::fromOperationalSubjectType)
                .collect(Collectors.toList());
        OperationalSubjectTypesContract operationalSubjectTypesContract = new OperationalSubjectTypesContract();
        operationalSubjectTypesContract.setOrganisationUUID(org.getUuid());
        operationalSubjectTypesContract.setOperationalSubjectTypes(operationalSubjectTypeContracts);
        addFileToZip(zos, "operationalSubjectTypes.json", operationalSubjectTypesContract);

    }

    private void addSubjectTypesJson(Long orgId, ZipOutputStream zos) throws IOException {
        Stream<SubjectType> subjectTypes = subjectTypeRepository.findAllByOrganisationId(orgId).stream();
        List<SubjectTypeContract> subjectTypeContracts = subjectTypes.map(SubjectTypeContract::fromSubjectType)
                .collect(Collectors.toList());
        addFileToZip(zos, "subjectTypes.json", subjectTypeContracts);
    }

    private void addCatchmentsJson(Organisation organisation, ZipOutputStream zos) throws IOException {
        Stream<Catchment> allCatchments = catchmentRepository.findAllByOrganisationId(organisation.getId()).stream();
        List<CatchmentExport> catchmentExports = allCatchments.map(CatchmentExport::fromCatchment).collect(Collectors.toList());
        CatchmentsExport catchmentsExport = new CatchmentsExport();
        catchmentsExport.setOrganisation(organisation.getName());
        catchmentsExport.setCatchments(catchmentExports);
        addFileToZip(zos, "catchments.json", catchmentsExport);
    }

    private void addAddressLevelsJson(Long orgId, ZipOutputStream zos) throws IOException {
        List<LocationContract> contracts = new ArrayList<>();
        List<AddressLevel> allAddressLevels = locationRepository.findAllByOrganisationId(orgId);
        List<AddressLevel> rootNodes = allAddressLevels.stream()
                .filter(addressLevel -> addressLevel.getParent() == null)
                .collect(Collectors.toList());
        for (AddressLevel node : rootNodes) {
            addAddressLevel(node, allAddressLevels, contracts);
        }
        addFileToZip(zos, "locations.json", contracts);
    }

    private void addAddressLevel(AddressLevel theNode, List<AddressLevel> allAddressLevels, List<LocationContract> contracts) {
        List<AddressLevel> childNodes = allAddressLevels.stream()
                .filter(addressLevelType -> {
                    AddressLevel parent = addressLevelType.getParent();
                    return parent != null && parent.getId().equals(theNode.getId());
                })
                .collect(Collectors.toList());
        contracts.add(LocationContract.fromAddressLevel(theNode));
        for (AddressLevel child : childNodes) {
            addAddressLevel(child, allAddressLevels, contracts);
        }
    }

    private void addAddressLevelTypesJson(Long orgId, ZipOutputStream zos) throws IOException {

        List<AddressLevelTypeContract> contracts = new ArrayList<>();
        List<AddressLevelType> allAddressLevelTypes = addressLevelTypeRepository.findAllByOrganisationId(orgId);
        List<AddressLevelType> rootNodes = allAddressLevelTypes.stream()
                .filter(addressLevelType -> addressLevelType.getParent() == null)
                .collect(Collectors.toList());
        for (AddressLevelType node : rootNodes) {
            addAddressLevelType(node, allAddressLevelTypes, contracts);
        }
        addFileToZip(zos, "addressLevelTypes.json", contracts);
    }

    private void addAddressLevelType(AddressLevelType theNode, List<AddressLevelType> allAddressLevelTypes, List<AddressLevelTypeContract> contracts) {
        List<AddressLevelType> childNodes = allAddressLevelTypes.stream()
                .filter(addressLevelType -> {
                    AddressLevelType parent = addressLevelType.getParent();
                    return parent != null && parent.getId().equals(theNode.getId());
                })
                .collect(Collectors.toList());
        contracts.add(AddressLevelTypeContract.fromAddressLevelType(theNode));
        for (AddressLevelType child : childNodes) {
            addAddressLevelType(child, allAddressLevelTypes, contracts);
        }
    }

    private void addConceptsJson(Long orgId, ZipOutputStream zos) throws IOException {

        List<ConceptExport> conceptContracts = new ArrayList<>();
        List<Concept> naConcepts = conceptRepository.findAllByOrganisationIdAndDataType(orgId, "NA");
        List<Concept> codedConcepts = conceptRepository.findAllByOrganisationIdAndDataType(orgId, "Coded");
        List<Concept> otherThanCodedOrNA = conceptRepository.findAllByOrganisationIdAndDataTypeNotIn(orgId, new String[]{"NA", "Coded"});

        for (Concept concept : naConcepts) {
            conceptContracts.add(ConceptExport.fromConcept(concept));
        }
        for (Concept concept : codedConcepts) {
            conceptContracts.add(ConceptExport.fromConcept(concept));
        }
        for (Concept concept : otherThanCodedOrNA) {
            conceptContracts.add(ConceptExport.fromConcept(concept));
        }
        addFileToZip(zos, "concepts.json", conceptContracts);
    }

    private void addFormsJson(Long orgId, ZipOutputStream zos) throws IOException {
        List<Form> forms = formRepository.findAllByOrganisationId(orgId);
        if (forms.size() > 1) {
            addDirectoryToZip(zos, "forms");
        }
        for (Form form : forms) {
            FormContract formContract = FormContract.fromForm(form);
            addFileToZip(zos, String.format("forms/%s.json", form.getName()), formContract);
        }
    }

    private void addFileToZip(ZipOutputStream zos, String fileName, Object fileContent) throws IOException {
        ZipEntry entry = new ZipEntry(fileName);
        zos.putNextEntry(entry);
        if (fileContent != null) {
            PrettyPrinter prettyPrinter = new DefaultPrettyPrinter();
            byte[] bytes = objectMapper.writer(prettyPrinter).writeValueAsBytes(fileContent);
            zos.write(bytes);
        }
        zos.closeEntry();
    }

    private void addDirectoryToZip(ZipOutputStream zos, String directoryName) throws IOException {
        ZipEntry entry = new ZipEntry(String.format("%s/", directoryName));
        zos.putNextEntry(entry);
        zos.closeEntry();
    }

    private HttpHeaders getHttpHeaders() {
        HttpHeaders header = new HttpHeaders();
        header.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=impl.zip");
        header.add("Cache-Control", "no-cache, no-store, must-revalidate");
        header.add("Pragma", "no-cache");
        header.add("Expires", "0");
        return header;
    }
}
