package org.avni.web;

import org.avni.dao.DocumentationItemRepository;
import org.avni.domain.CHSEntity;
import org.avni.domain.DocumentationItem;
import org.joda.time.DateTime;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.hateoas.Link;
import org.springframework.hateoas.PagedResources;
import org.springframework.hateoas.Resource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.transaction.Transactional;

@RestController
public class DocumentationItemController extends AbstractController<DocumentationItem> implements RestControllerResourceProcessor<DocumentationItem> {

    private final DocumentationItemRepository documentationItemRepository;

    public DocumentationItemController(DocumentationItemRepository documentationItemRepository) {
        this.documentationItemRepository = documentationItemRepository;
    }

    @RequestMapping(value = "/documentationItems", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    @Transactional
    public PagedResources<Resource<DocumentationItem>> getDocumentationItems(
            @RequestParam("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime,
            @RequestParam("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime now,
            Pageable pageable) {
        return wrap(documentationItemRepository.findByLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(CHSEntity.toDate(lastModifiedDateTime), CHSEntity.toDate(now), pageable));
    }

    @Override
    public Resource<DocumentationItem> process(Resource<DocumentationItem> resource) {
        DocumentationItem documentationItem = resource.getContent();
        resource.removeLinks();
        resource.add(new Link(documentationItem.getDocumentation().getUuid(), "documentationUUID"));
        return resource;
    }
}
