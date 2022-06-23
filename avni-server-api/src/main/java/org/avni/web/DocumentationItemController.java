package org.avni.web;

import org.avni.domain.DocumentationItem;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DocumentationItemController extends AbstractController<DocumentationItem> implements RestControllerResourceProcessor<DocumentationItem> {
}
