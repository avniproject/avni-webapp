package org.openchs.web;

import com.amazonaws.HttpMethod;
import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.AmazonS3URI;
import com.amazonaws.services.s3.model.GeneratePresignedUrlRequest;
import org.openchs.domain.UserContext;
import org.openchs.framework.security.UserContextHolder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.net.URL;
import java.time.Duration;
import java.util.Date;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static java.lang.String.format;

@RestController
public class MediaController {
    private final Logger logger;

    @Value("${openchs.bucketName}")
    private String bucketName;

    @Value("${aws.accessKeyId}")
    private String accessKeyId;

    @Value("${aws.secretAccessKey}")
    private String secretAccessKey;

    private Regions REGION = Regions.AP_SOUTH_1;
    private long UPLOAD_EXPIRY_DURATION = Duration.ofHours(1).toMillis();
    private long DOWNLOAD_EXPIRY_DURATION = Duration.ofMinutes(2).toMillis();
    private AmazonS3 s3Client;
    private Pattern mediaDirPattern = Pattern.compile("^/?(?<mediaDir>[^/]+)/.+$");

    @Autowired
    public MediaController() {
        logger = LoggerFactory.getLogger(this.getClass());
    }

    @PostConstruct
    public void init() {
        s3Client = AmazonS3ClientBuilder.standard()
                .withRegion(REGION)
                .withCredentials(getCredentialsProvider())
                .build();
    }

    @RequestMapping(value = "/media/uploadUrl/{fileName:.+}", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    public ResponseEntity<String> generateUploadUrl(@PathVariable String fileName) {

        UserContext userContext = UserContextHolder.getUserContext();
        if (userContext == null) {
            logger.error("UserContext is null");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Forbidden");
        }

        String mediaDirectory = userContext.getOrganisation().getMediaDirectory();
        if (mediaDirectory == null || bucketName == null) {
            logger.error("Setup error. Media directory needs to be set up in organisation table. openchs.bucketName should be present in properties file");
            logger.error(format("Media directory = %s, Bucket Name = %s", mediaDirectory, bucketName));
        }

        String objectKey = format("%s/%s", mediaDirectory, fileName);

        GeneratePresignedUrlRequest generatePresignedUrlRequest =
                new GeneratePresignedUrlRequest(bucketName, objectKey)
                        .withMethod(HttpMethod.PUT)
                        .withExpiration(getExpireDate(UPLOAD_EXPIRY_DURATION));
        URL url = s3Client.generatePresignedUrl(generatePresignedUrlRequest);

        logger.debug(format("Generating presigned url: %s", url.toString()));

        return ResponseEntity.ok(url.toString());
    }

    @RequestMapping(value = "/media/signedUrl", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    public ResponseEntity<String> generateDownloadUrl(@RequestParam String url) throws IOException {
        UserContext userContext = UserContextHolder.getUserContext();
        if (userContext == null) {
            logger.error("UserContext is null");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Authentication required");
        }

        String mediaDirectory = userContext.getOrganisation().getMediaDirectory();
        if (mediaDirectory == null || bucketName == null) {
            logger.error("Setup error. Media directory needs to be set up in organisation table. openchs.bucketName should be present in properties file");
            logger.error(format("Media directory = %s, Bucket Name = %s", mediaDirectory, bucketName));
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Information missing. Media Directory for Implementation or Bucket name for Environment absent");
        }

        AmazonS3URI amazonS3URI = new AmazonS3URI(url);
        String objectKey = amazonS3URI.getKey();
        Matcher matcher = mediaDirPattern.matcher(objectKey);
        String mediaDirectoryFromUrl = null;
        if(matcher.find()) {
            mediaDirectoryFromUrl = matcher.group("mediaDir");
        }
        if (!mediaDirectory.equals(mediaDirectoryFromUrl)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(format("User '%s' not authorized", userContext.getUserName()));
        }

        GeneratePresignedUrlRequest generatePresignedUrlRequest =
                new GeneratePresignedUrlRequest(bucketName, objectKey)
                        .withMethod(HttpMethod.GET)
                        .withExpiration(getExpireDate(DOWNLOAD_EXPIRY_DURATION));
        return ResponseEntity.ok(s3Client.generatePresignedUrl(generatePresignedUrlRequest).toString());
    }

    private AWSStaticCredentialsProvider getCredentialsProvider() {
        return new AWSStaticCredentialsProvider(new BasicAWSCredentials(accessKeyId, secretAccessKey));
    }

    private Date getExpireDate(long expireDuration) {
        Date expiration = new Date();
        expiration.setTime(expiration.getTime() + expireDuration);
        return expiration;
    }
}
