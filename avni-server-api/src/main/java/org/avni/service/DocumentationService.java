package org.avni.service;

import org.avni.common.EntityHelper;
import org.avni.dao.DocumentationItemRepository;
import org.avni.dao.DocumentationNodeRepository;
import org.avni.dao.DocumentationRepository;
import org.avni.domain.*;
import org.avni.web.request.CHSRequest;
import org.avni.web.request.webapp.documentation.DocumentationContract;
import org.avni.web.request.webapp.documentation.DocumentationItemContract;
import org.avni.web.request.webapp.documentation.DocumentationNodeContract;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class DocumentationService/* implements NonScopeAwareService*/ {

    private final DocumentationRepository documentationRepository;

    @Autowired
    public DocumentationService(DocumentationRepository documentationRepository) {
        this.documentationRepository = documentationRepository;
    }

    public Documentation get(String UUID) {
        return documentationRepository.findByUuid(UUID);
    }
}
