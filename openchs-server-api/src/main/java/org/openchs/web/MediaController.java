package org.openchs.web;

import org.openchs.domain.User;
import org.openchs.framework.security.UserContextHolder;
import org.openchs.service.S3Service;
import org.openchs.util.AvniFiles;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.awt.*;
import java.io.File;
import java.io.IOException;
import java.net.URL;
import java.util.UUID;

import static java.lang.String.format;

@RestController
public class MediaController {
    private final Logger logger;
    private final S3Service s3Service;

    @Autowired
    public MediaController(S3Service s3Service) {
        this.s3Service = s3Service;
        logger = LoggerFactory.getLogger(this.getClass());
    }

    @RequestMapping(value = "/media/uploadUrl/{fileName:.+}", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user', 'organisation_admin')")
    public ResponseEntity<String> generateUploadUrl(@PathVariable String fileName) {
        try {
            logger.info("getting media upload url");
            URL url = s3Service.generateMediaUploadUrl(fileName);
            logger.debug(format("Generating pre-signed url: %s", url.toString()));
            return ResponseEntity.ok().contentType(MediaType.TEXT_PLAIN).body(url.toString());
        } catch (AccessDeniedException e) {
            logger.error(e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            logger.error(e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @RequestMapping(value = "/media/signedUrl", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user', 'organisation_admin')")
    public ResponseEntity<String> generateDownloadUrl(@RequestParam String url) {
        try {
            return ResponseEntity.ok().contentType(MediaType.TEXT_PLAIN).body(s3Service.generateMediaDownloadUrl(url).toString());
        } catch (AccessDeniedException e) {
            logger.error(e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            logger.error(e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @PostMapping("/media/saveImage")
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin', 'admin')")
    public ResponseEntity<?> saveImage(@RequestParam MultipartFile file, @RequestParam String bucketName) {
        String uuid = UUID.randomUUID().toString();
        User user = UserContextHolder.getUserContext().getUser();
        File tempSourceFile;
        try {
            tempSourceFile = AvniFiles.convertMultiPartToFile(file, "");
            AvniFiles.ImageType imageType = AvniFiles.guessImageTypeFromStream(tempSourceFile);
            if(AvniFiles.ImageType.Unknown.equals(imageType)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).contentType(MediaType.TEXT_PLAIN).body("Unsupported file. Use .bmp, .jpg, .jpeg, .png, .gif file.");
            }
            if (bucketName.equals("icons") && isInvalidDimension(tempSourceFile, imageType)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).contentType(MediaType.TEXT_PLAIN).body("Unsupported file. Use image of size 75 X 75 or smaller.");
            }
            if (bucketName.equals("news") && isInvalidImageSize(file)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).contentType(MediaType.TEXT_PLAIN).body("Unsupported file. Use image of size 500KB or smaller.");
            }
            String targetFilePath = format("%s/%s%s", bucketName, uuid, imageType.EXT);
            URL s3FileUrl = s3Service.uploadImageFile(tempSourceFile, targetFilePath);
            return ResponseEntity.ok().contentType(MediaType.TEXT_PLAIN).body(s3FileUrl.toString());
        } catch (Exception e) {
            logger.error(format("Image upload failed. bucketName: '%s' file:'%s', user:'%s'", bucketName, file.getOriginalFilename(), user.getUsername()));
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(format("Unable to save Image. %s", e.getMessage()));
        }
    }

    private boolean isInvalidImageSize(MultipartFile file) {
        return AvniFiles.getSizeInKB(file) > 500;
    }

    private boolean isInvalidDimension(File tempSourceFile, AvniFiles.ImageType imageType) throws IOException {
        Dimension dimension = AvniFiles.getImageDimension(tempSourceFile, imageType);
        return dimension.getHeight() > 75 || dimension.getWidth() > 75;
    }
}
