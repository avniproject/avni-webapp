package org.avni.server.web;

import org.avni.server.dao.ImplementationRepository;
import org.avni.server.domain.Extension;
import org.avni.server.domain.Organisation;
import org.avni.server.framework.security.UserContextHolder;
import org.avni.server.service.OrganisationConfigService;
import org.avni.server.service.S3Service;
import org.avni.server.util.AvniFiles;
import org.avni.server.web.request.ExtensionRequest;
import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.data.domain.PageImpl;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.hateoas.PagedResources;
import org.springframework.hateoas.Resource;
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
import java.util.Optional;
import java.util.UUID;

import static java.lang.String.format;

@RestController
public class ExtensionController implements RestControllerResourceProcessor<Extension> {
    private final String EXTENSION_DIR = "extensions";
    private final Logger logger;
    private final S3Service s3Service;
    private final OrganisationConfigService organisationConfigService;
    private final ImplementationRepository implementationRepository;

    @Autowired
    public ExtensionController(S3Service s3Service, OrganisationConfigService organisationConfigService,
                               ImplementationRepository implementationRepository) {
        this.s3Service = s3Service;
        this.organisationConfigService = organisationConfigService;
        this.implementationRepository = implementationRepository;
        logger = LoggerFactory.getLogger(this.getClass());
    }

    @PostMapping("/extension/upload")
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin', 'admin')")
    @Transactional
    public ResponseEntity<?> uploadExtensions(@RequestPart(value = "file") MultipartFile file,
                                              @RequestPart(value = "extensionSettings") @Valid List<ExtensionRequest> extensionSettings) {
        organisationConfigService.updateSettings(EXTENSION_DIR, extensionSettings);
        try {
            Path tempPath = Files.createTempDirectory(UUID.randomUUID().toString()).toFile().toPath();
            AvniFiles.extractFileToPath(file, tempPath);
            s3Service.uploadExtensionFile(tempPath.toFile(), EXTENSION_DIR);
            return ResponseEntity.ok().build();
        } catch (IOException e) {
            logger.error(format("Error while uploading the files %s", e.getMessage()));
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            logger.error(format("Error while uploading the files %s", e.getMessage()));
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @GetMapping(value = "/extensions")
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin', 'admin', 'user')")
    public PagedResources<Resource<Extension>> listExtensionFiles(@RequestParam("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Optional<DateTime> lastModifiedDateTime) {
        return wrap(new PageImpl<>(s3Service.listExtensionFiles(lastModifiedDateTime)));
    }

    @RequestMapping(value = "/extension/{basePath}/**", method = RequestMethod.GET)
    public ResponseEntity<?> serveExtensionFile(@CookieValue(name = "IMPLEMENTATION-NAME", required = false) String implementationName, @PathVariable String basePath, HttpServletRequest request) {
        Organisation organisation = UserContextHolder.getOrganisation();
        if (organisation == null) {
            organisation = implementationRepository.findByName(implementationName);
            if (organisation == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
            }
        }
        final String path = request.getAttribute(HandlerMapping.PATH_WITHIN_HANDLER_MAPPING_ATTRIBUTE).toString();
        final String bestMatchingPattern = request.getAttribute(HandlerMapping.BEST_MATCHING_PATTERN_ATTRIBUTE).toString();
        String arguments = new AntPathMatcher().extractPathWithinPattern(bestMatchingPattern, path);
        String filePath = null != arguments && !arguments.isEmpty() ? basePath + "/" + arguments : basePath;
        logger.info(format("Getting the content of extension file %s", filePath));
        try {
            InputStream contentStream = s3Service.getExtensionContent(format("%s/%s", EXTENSION_DIR, filePath), organisation);
            return ResponseEntity.ok().body(new InputStreamResource(contentStream));
        } catch (AccessDeniedException e) {
            logger.error(e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            logger.error(e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(format("Error in serving file %s", filePath));
        }
    }


    @RequestMapping(value = "/extension/serve/{basePath}/**", method = RequestMethod.GET)
    public ResponseEntity<?> serveCustomPrintFile(@CookieValue(name = "IMPLEMENTATION-NAME") String implementationName, @PathVariable String basePath, HttpServletRequest request) {
        Organisation organisation = implementationRepository.findByName(implementationName);
        if (organisation == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
        final String path = request.getAttribute(HandlerMapping.PATH_WITHIN_HANDLER_MAPPING_ATTRIBUTE).toString();
        final String bestMatchingPattern = request.getAttribute(HandlerMapping.BEST_MATCHING_PATTERN_ATTRIBUTE).toString();
        String arguments = new AntPathMatcher().extractPathWithinPattern(bestMatchingPattern, path);
        String filePath = null != arguments && !arguments.isEmpty() ? basePath + "/" + arguments : basePath;
        logger.info(format("Generating url for extension file %s", filePath));
        try {
            URL url = s3Service.getURLForExtensions(format("%s/%s", EXTENSION_DIR, filePath), organisation);
            logger.debug(format("S3 signed URL: %s", url.toString()));
            return ResponseEntity.status(HttpStatus.FOUND).location(url.toURI()).build();
        } catch (AccessDeniedException e) {
            logger.error(e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            logger.error(e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
}
