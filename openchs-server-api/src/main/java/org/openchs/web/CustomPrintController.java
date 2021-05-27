package org.openchs.web;

import org.openchs.dao.ImplementationRepository;
import org.openchs.domain.Organisation;
import org.openchs.service.OrganisationConfigService;
import org.openchs.service.S3Service;
import org.openchs.util.AvniFiles;
import org.openchs.web.request.CustomPrintRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.HandlerMapping;

import javax.servlet.http.HttpServletRequest;
import javax.transaction.Transactional;
import javax.validation.Valid;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.UUID;

import static java.lang.String.format;

@RestController
public class CustomPrintController {
    private final String CUSTOM_PRINT_DIR = "prints";
    private final Logger logger;
    private final S3Service s3Service;
    private final OrganisationConfigService organisationConfigService;
    private final ImplementationRepository implementationRepository;

    @Autowired
    public CustomPrintController(S3Service s3Service, OrganisationConfigService organisationConfigService,
                           ImplementationRepository implementationRepository) {
        this.s3Service = s3Service;
        this.organisationConfigService = organisationConfigService;
        this.implementationRepository = implementationRepository;
        logger = LoggerFactory.getLogger(this.getClass());
    }

    @PostMapping("/customPrint/upload")
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin', 'admin')")
    @Transactional
    public ResponseEntity<?> uploadCustomPrint(@RequestPart(value = "file") MultipartFile file,
                                               @RequestPart(value = "printSettings") @Valid List<CustomPrintRequest> printSettings) {
        organisationConfigService.updateSettings(CUSTOM_PRINT_DIR, printSettings);
        try {
            Path tempPath = Files.createTempDirectory(UUID.randomUUID().toString()).toFile().toPath();
            AvniFiles.extractFileToPath(file, tempPath);
            s3Service.uploadCustomPrintFile(tempPath.toFile(), CUSTOM_PRINT_DIR);
            return ResponseEntity.ok().build();
        } catch (IOException e) {
            logger.error(format("Error while uploading the files %s", e.getMessage()));
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            logger.error(format("Error while uploading the files %s", e.getMessage()));
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @RequestMapping(value = "/customPrint/{basePath}/**", method = RequestMethod.GET)
    public ResponseEntity<?> serveCustomPrintFile(@CookieValue(name = "IMPLEMENTATION-NAME") String implementationName, @PathVariable String basePath, HttpServletRequest request) {
        Organisation organisation = implementationRepository.findByName(implementationName);
        if (organisation == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
        final String path = request.getAttribute(HandlerMapping.PATH_WITHIN_HANDLER_MAPPING_ATTRIBUTE).toString();
        final String bestMatchingPattern = request.getAttribute(HandlerMapping.BEST_MATCHING_PATTERN_ATTRIBUTE).toString();
        String arguments = new AntPathMatcher().extractPathWithinPattern(bestMatchingPattern, path);
        String filePath = null != arguments && !arguments.isEmpty() ? basePath + "/" + arguments : basePath;
        logger.info(format("Getting the content of custom print file %s", filePath));
        try {
            InputStream contentStream = s3Service.getCustomPrintContent(format("%s/%s", CUSTOM_PRINT_DIR, filePath), organisation);
            return ResponseEntity.ok().body(new InputStreamResource(contentStream));
        } catch (AccessDeniedException e) {
            logger.error(e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            logger.error(e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(format("Error in serving file %s", filePath));
        }
    }


}
