package org.avni.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import org.joda.time.DateTime;

@Service
public class ExtensionService implements NonScopeAwareService {

    private final S3Service s3Service;

    @Autowired
    public ExtensionService(S3Service s3Service) {
        this.s3Service = s3Service;
    }

    @Override
    public boolean isNonScopeEntityChanged(DateTime lastModifiedDateTime) {
        return s3Service.listExtensionFiles(java.util.Optional.ofNullable(lastModifiedDateTime)).size() > 0;
    }
}
