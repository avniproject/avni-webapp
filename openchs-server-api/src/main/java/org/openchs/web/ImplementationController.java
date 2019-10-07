package org.openchs.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.openchs.application.Form;
import org.openchs.dao.AddressLevelTypeRepository;
import org.openchs.dao.ConceptRepository;
import org.openchs.dao.LocationRepository;
import org.openchs.dao.UserRepository;
import org.openchs.dao.application.FormRepository;
import org.openchs.domain.AddressLevelType;
import org.openchs.domain.Concept;
import org.openchs.framework.security.UserContextHolder;
import org.openchs.util.ObjectMapperSingleton;
import org.openchs.web.request.AddressLevelTypeContract;
import org.openchs.web.request.application.FormContract;
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
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@RestController
public class ImplementationController implements RestControllerResourceProcessor<Concept> {
    private ConceptRepository conceptRepository;
    private final FormRepository formRepository;
    private final UserRepository userRepository;
    private final AddressLevelTypeRepository addressLevelTypeRepository;
    private final LocationRepository locationRepository;
    private ObjectMapper objectMapper;

    @Autowired
    public ImplementationController(ConceptRepository conceptRepository,
                                    FormRepository formRepository,
                                    UserRepository userRepository,
                                    AddressLevelTypeRepository addressLevelTypeRepository,
                                    LocationRepository locationRepository) {
        this.conceptRepository = conceptRepository;
        this.formRepository = formRepository;
        this.userRepository = userRepository;
        this.addressLevelTypeRepository = addressLevelTypeRepository;
        this.locationRepository = locationRepository;
        objectMapper = ObjectMapperSingleton.getObjectMapper();
    }

    @RequestMapping(value = "/implementation/export", method = RequestMethod.GET)
    @PreAuthorize("hasAnyAuthority('admin','organisation_admin')")
    public ResponseEntity<ByteArrayResource> export() throws IOException {

        Long orgId = UserContextHolder.getUserContext().getOrganisation().getId();

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        //ZipOutputStream will be automatically closed because we are using try-with-resources.
        try (ZipOutputStream zos = new ZipOutputStream(baos)) {
            addAddressLevelTypesJson(orgId, zos);
            addLocationsJson(orgId, zos);
            addConceptsJson(orgId, zos);
            addFormsJson(orgId, zos);
        }

        byte[] baosByteArray = baos.toByteArray();

        return ResponseEntity.ok()
                .headers(getHttpHeaders())
                .contentLength(baosByteArray.length)
                .contentType(MediaType.parseMediaType("application/octet-stream"))
                .body(new ByteArrayResource(baosByteArray));

    }

    private void addLocationsJson(Long orgId, ZipOutputStream zos) throws IOException {

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
        byte[] bytes = objectMapper.writer().writeValueAsBytes(contracts);
        addFileToZip(zos, "addressLevelTypes.json", bytes);
    }

    private void addAddressLevelType(AddressLevelType node, List<AddressLevelType> allAddressLevelTypes, List<AddressLevelTypeContract> contracts) {
        List<AddressLevelType> children = allAddressLevelTypes.stream()
                .filter(addressLevelType -> {
                    AddressLevelType parent = addressLevelType.getParent();
                    return parent != null && parent.getId().equals(node.getId());
                })
                .collect(Collectors.toList());
        contracts.add(AddressLevelTypeContract.fromAddressLevelType(node));
        for (AddressLevelType child : children) {
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
        byte[] conceptsByteArray = objectMapper.writer().writeValueAsBytes(conceptContracts);
        addFileToZip(zos, "concepts.json", conceptsByteArray);
    }

    private void addFormsJson(Long orgId, ZipOutputStream zos) throws IOException {
        List<Form> forms = formRepository.findAllByOrganisationId(orgId);
        if (forms.size() > 1) {
            addDirectoryToZip(zos, "forms");
        }
        for (Form form : forms) {
            FormContract formContract = FormContract.fromForm(form);
            addFileToZip(zos, String.format("forms/%s.json", form.getName()), objectMapper.writer().writeValueAsBytes(formContract));
        }
    }

    private void addFileToZip(ZipOutputStream zos, String fileName, byte[] fileContent) throws IOException {
        ZipEntry entry = new ZipEntry(fileName);
        zos.putNextEntry(entry);
        if (fileContent != null)
            zos.write(fileContent);
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
