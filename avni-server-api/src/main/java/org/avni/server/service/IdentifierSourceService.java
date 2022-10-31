package org.avni.server.service;

import org.avni.server.dao.CatchmentRepository;
import org.avni.server.dao.IdentifierSourceRepository;
import org.avni.server.domain.CHSEntity;
import org.avni.server.domain.Catchment;
import org.avni.server.domain.IdentifierSource;
import org.avni.server.domain.JsonObject;
import org.avni.server.web.request.webapp.IdentifierSourceContractWeb;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import org.joda.time.DateTime;
import java.util.UUID;

@Service
public class IdentifierSourceService implements NonScopeAwareService {
    private final CatchmentRepository catchmentRepository;
    private final IdentifierSourceRepository identifierSourceRepository;

    @Autowired
    public IdentifierSourceService(CatchmentRepository catchmentRepository, IdentifierSourceRepository identifierSourceRepository) {
        this.catchmentRepository = catchmentRepository;
        this.identifierSourceRepository = identifierSourceRepository;
    }

    public IdentifierSource saveIdSource(IdentifierSourceContractWeb request) {
        IdentifierSource identifierSource = identifierSourceRepository.findByUuid(request.getUUID());
        if (identifierSource == null) {
            identifierSource = new IdentifierSource();
            identifierSource.setUuid(request.getUUID() == null ? UUID.randomUUID().toString() : request.getUUID());
        }
        return identifierSourceRepository.save(createIdSource(identifierSource, request));
    }

    public IdentifierSource updateIdSource(IdentifierSource identifierSource, IdentifierSourceContractWeb request) {
        return identifierSourceRepository.save(createIdSource(identifierSource, request));
    }

    private IdentifierSource createIdSource(IdentifierSource identifierSource, IdentifierSourceContractWeb request) {
        identifierSource.setBatchGenerationSize(request.getBatchGenerationSize());
        identifierSource.setCatchment(getCatchment(request.getCatchmentId(), request.getCatchmentUUID()));
        identifierSource.setMinimumBalance(request.getMinimumBalance());
        identifierSource.setName(request.getName());
        identifierSource.setOptions(request.getOptions() == null ? new JsonObject() : request.getOptions());
        identifierSource.setType(request.getType());
        identifierSource.setVoided(request.isVoided());
        identifierSource.setMinLength(request.getMinLength());
        identifierSource.setMaxLength(request.getMaxLength());
        return identifierSource;
    }

    private Catchment getCatchment(Long catchmentId, String catchmentUUID) {
        if (catchmentId == null && catchmentUUID == null) {
            return null;
        }
        return catchmentUUID != null ? catchmentRepository.findByUuid(catchmentUUID) : catchmentRepository.findOne(catchmentId);
    }

    @Override
    public boolean isNonScopeEntityChanged(DateTime lastModifiedDateTime) {
        return identifierSourceRepository.existsByLastModifiedDateTimeGreaterThan(CHSEntity.toDate(lastModifiedDateTime));
    }
}
