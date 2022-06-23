package org.avni.web;

import org.avni.domain.DocumentationNode;
import org.avni.service.DocumentationNodeService;
import org.avni.web.request.webapp.documentation.DocumentationNodeContract;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;
import java.util.List;

@RestController
public class DocumentationNodeController extends AbstractController<DocumentationNode> implements RestControllerResourceProcessor<DocumentationNode> {

    private final DocumentationNodeService documentationNodeService;

    @Autowired
    public DocumentationNodeController(DocumentationNodeService documentationNodeService) {
        this.documentationNodeService = documentationNodeService;
    }

    @GetMapping(value = "/web/documentation")
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin')")
    @ResponseBody
    public List<DocumentationNodeContract> getAllDocumentNodes() {
        return documentationNodeService.getAll();
    }

    @PostMapping(value = "/web/documentation")
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin')")
    @Transactional
    @ResponseBody
    public ResponseEntity<DocumentationNodeContract> saveDocumentation(@RequestBody DocumentationNodeContract documentationNodeContract) {
        DocumentationNode savedDocumentation = documentationNodeService.saveDocumentation(documentationNodeContract);
        return ResponseEntity.ok(DocumentationNodeContract.fromDocumentationNode(savedDocumentation));
    }


}
