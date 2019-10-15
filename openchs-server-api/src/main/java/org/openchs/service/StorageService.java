package org.openchs.service;

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
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.net.URL;
import java.net.URLConnection;
import java.time.Duration;
import java.util.Date;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static java.lang.String.format;

@Service
public class StorageService {
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
    private Logger logger;

    @Autowired
    public StorageService() {
        logger = LoggerFactory.getLogger(getClass());
    }

    @PostConstruct
    public void init() {
        s3Client = AmazonS3ClientBuilder.standard()
                .withRegion(REGION)
                .withCredentials(getCredentialsProvider())
                .build();
    }

    private String getContentType(String fileName) {
        return URLConnection.guessContentTypeFromName(fileName);
    }

    public URL generateMediaUploadUrl(String fileName) {
        authorizeUser();
        String mediaDirectory = getMediaDirectory();

        String objectKey = format("%s/%s", mediaDirectory, fileName);

        GeneratePresignedUrlRequest generatePresignedUrlRequest =
                new GeneratePresignedUrlRequest(bucketName, objectKey)
                        .withMethod(HttpMethod.PUT)
                        .withContentType(getContentType(fileName))
                        .withExpiration(getExpireDate(UPLOAD_EXPIRY_DURATION));

        return s3Client.generatePresignedUrl(generatePresignedUrlRequest);
    }

    public URL generateMediaDownloadUrl(String url) {
        UserContext userContext = authorizeUser();
        String mediaDirectory = getMediaDirectory();

        AmazonS3URI amazonS3URI = new AmazonS3URI(url);
        String objectKey = amazonS3URI.getKey();
        Matcher matcher = mediaDirPattern.matcher(objectKey);
        String mediaDirectoryFromUrl = null;
        if (matcher.find()) {
            mediaDirectoryFromUrl = matcher.group("mediaDir");
        }
        if (!mediaDirectory.equals(mediaDirectoryFromUrl) || !(bucketName.equals(amazonS3URI.getBucket()))) {
            String message = format("User '%s' not authorized to access '%s'", userContext.getUserName(), url);
            throw new AccessDeniedException(message);
        }

        GeneratePresignedUrlRequest generatePresignedUrlRequest =
                new GeneratePresignedUrlRequest(bucketName, objectKey)
                        .withMethod(HttpMethod.GET)
                        .withExpiration(getExpireDate(DOWNLOAD_EXPIRY_DURATION));
        return s3Client.generatePresignedUrl(generatePresignedUrlRequest);
    }

    private AWSStaticCredentialsProvider getCredentialsProvider() {
        return new AWSStaticCredentialsProvider(new BasicAWSCredentials(accessKeyId, secretAccessKey));
    }

    private Date getExpireDate(long expireDuration) {
        Date expiration = new Date();
        expiration.setTime(expiration.getTime() + expireDuration);
        return expiration;
    }

    private UserContext authorizeUser() {
        UserContext userContext = UserContextHolder.getUserContext();
        if (userContext == null) {
            String message = "UserContext is null";
            throw new AccessDeniedException(message);
        }
        return userContext;
    }

    private String getMediaDirectory() {
        String mediaDirectory = UserContextHolder.getUserContext().getOrganisation().getMediaDirectory();
        if (mediaDirectory == null || bucketName == null) {
            logger.error("Setup error. Media directory needs to be set up in organisation table. openchs.bucketName should be present in properties file");
            logger.error(format("Media directory = %s, Bucket Name = %s", mediaDirectory, bucketName));
            throw new IllegalStateException("Information missing. Media Directory for Implementation or Bucket name for Environment absent");
        }
        return mediaDirectory;
    }

}
