package org.avni.web;

import org.avni.application.projections.DocumentationProjection;
import org.avni.dao.DocumentationRepository;
import org.avni.domain.CHSEntity;
import org.avni.domain.Documentation;
import org.avni.util.ReactAdminUtil;
import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.hateoas.PagedResources;
import org.springframework.hateoas.Resource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;

@RestController
public class DocumentationController extends AbstractController<Documentation> implements RestControllerResourceProcessor<Documentation> {

    private final DocumentationRepository documentationRepository;


    @Autowired
    public DocumentationController(DocumentationRepository documentationRepository) {
        this.documentationRepository = documentationRepository;
    }

    @RequestMapping(value = "/search/documentation", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('admin', 'user')")
    public Page<DocumentationProjection> searchDocumentation(@RequestParam String name, Pageable pageable) {
        return documentationRepository.findByIsVoidedFalseAndNameIgnoreCaseContains(name, pageable);
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

    @RequestMapping(value = "/documentations", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    @Transactional
    public PagedResources<Resource<Documentation>> getDocumentations(
            @RequestParam("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime,
            @RequestParam("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime now,
            Pageable pageable) {
        return wrap(documentationRepository.findByLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(CHSEntity.toDate(lastModifiedDateTime), CHSEntity.toDate(now), pageable));
    }
}
