package org.avni.web;

import org.avni.dao.DocumentationRepository;
import org.avni.domain.Documentation;
import org.avni.util.ReactAdminUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import javax.transaction.Transactional;

@RestController
public class DocumentationController extends AbstractController<Documentation> implements RestControllerResourceProcessor<Documentation> {

    private final DocumentationRepository documentationRepository;

    @Autowired
    public DocumentationController(DocumentationRepository documentationRepository) {
        this.documentationRepository = documentationRepository;
    }

    @DeleteMapping(value = "/web/documentation/{id}")
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin')")
    @ResponseBody
    @Transactional
    public void deleteIndividualRelation(@PathVariable String id) {
        Documentation documentation = documentationRepository.findByUuid(id);
        if (documentation != null) {
            documentation.setVoided(true);
            documentation.setName(ReactAdminUtil.getVoidedName(documentation.getName(), documentation.getId()));
            documentationRepository.save(documentation);
        }
    }
}
