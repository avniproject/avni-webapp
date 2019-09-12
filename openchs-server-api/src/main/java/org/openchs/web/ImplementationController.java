package org.openchs.web;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.openchs.application.Form;
import org.openchs.dao.ConceptRepository;
import org.openchs.dao.application.FormRepository;
import org.openchs.domain.Concept;
import org.openchs.framework.security.UserContextHolder;
import org.openchs.service.ConceptService;
import org.openchs.util.ObjectMapperSingleton;
import org.openchs.web.request.application.FormContract;
import org.openchs.web.request.webapp.ConceptExport;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.data.projection.ProjectionFactory;
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
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@RestController
public class ImplementationController implements RestControllerResourceProcessor<Concept> {
    private ConceptRepository conceptRepository;
    private final FormRepository formRepository;
    private ObjectMapper objectMapper;

    @Autowired
    public ImplementationController(ConceptRepository conceptRepository, FormRepository formRepository) {
        this.conceptRepository = conceptRepository;
        this.formRepository = formRepository;
        objectMapper = ObjectMapperSingleton.getObjectMapper();
    }

    @RequestMapping(value = "/implementation/export", method = RequestMethod.GET)
    @PreAuthorize("hasAnyAuthority('admin','organisation_admin')")
    public ResponseEntity<ByteArrayResource> export() throws IOException {

        Long orgId = UserContextHolder.getUserContext().getOrganisation().getId();

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        //ZipOutputStream will be automatically closed because we are using try-with-resources.
        try (ZipOutputStream zos = new ZipOutputStream(baos)
        ) {
            createZipEntry(zos, "concepts.json", conceptsJson(orgId));
            List<Form> forms = formRepository.findAllByOrganisationId(orgId);
            if (forms.size() > 1) {
                createZipEntry(zos, "forms/", null);
            }
            for (Form form : forms) {
                FormContract formContract = FormContract.fromForm(form);
                createZipEntry(zos, String.format("forms/%s.json", form.getName()), objectMapper.writer().writeValueAsBytes(formContract));
            }
        }

        byte[] baosByteArray = baos.toByteArray();

        return ResponseEntity.ok()
                .headers(getHttpHeaders())
                .contentLength(baosByteArray.length)
                .contentType(MediaType.parseMediaType("application/octet-stream"))
                .body(new ByteArrayResource(baosByteArray));

    }

    private void createZipEntry(ZipOutputStream zos, String entryName, byte[] fileContent) throws IOException {
        ZipEntry entry = new ZipEntry(entryName);
        zos.putNextEntry(entry);
        if(fileContent != null)
            zos.write(fileContent);
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

    private byte[] formJson() throws JsonProcessingException {
        List<Form> forms = formRepository.findAll();

        return new byte[]{'\0'};
    }

    private byte[] conceptsJson(Long orgId) throws JsonProcessingException {

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
        return conceptsByteArray;
    }


}
