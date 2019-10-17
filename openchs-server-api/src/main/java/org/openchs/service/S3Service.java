package org.openchs.service;

import com.amazonaws.HttpMethod;
import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.AmazonS3URI;
import com.amazonaws.services.s3.model.GeneratePresignedUrlRequest;
import com.amazonaws.services.s3.model.PutObjectRequest;
import org.openchs.domain.UserContext;
import org.openchs.framework.security.UserContextHolder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.annotation.PostConstruct;
import java.io.*;
import java.net.URL;
import java.net.URLConnection;
import java.time.Duration;
import java.util.Date;
import java.util.Objects;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static java.lang.String.format;

@Service
public class S3Service {
    private final String bulkuploadDir = "bulkuploadfiles";

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
    public S3Service() {
        logger = LoggerFactory.getLogger(getClass());
    }

    @PostConstruct
    public void init() {
        s3Client = AmazonS3ClientBuilder.standard()
                .withRegion(REGION)
                .withCredentials(new AWSStaticCredentialsProvider(new BasicAWSCredentials(accessKeyId, secretAccessKey)))
                .build();
        if (bucketName == null) {
            logger.error("Setup error. openchs.bucketName should be present in properties file");
            throw new IllegalStateException("Configuration missing. S3 Bucket name not configured.");
        }
    }

    private String getContentType(String fileName) {
        return URLConnection.guessContentTypeFromName(fileName);
    }

    public URL generateMediaUploadUrl(String fileName) {
        authorizeUser();
        String mediaDirectory = getOrgDirectoryName();

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
        String mediaDirectory = getOrgDirectoryName();

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

    public String uploadFile(String uuid, MultipartFile requestFile) throws IOException {
        Objects.requireNonNull(requestFile.getOriginalFilename());
        String originalFileName = requestFile.getOriginalFilename().replace(" ", "_");

        File localFile = convertMultiPartToFile(requestFile);
        String objectKey = putFile(uuid, originalFileName, localFile);
        localFile.delete();
        return objectKey;
    }

    private String putFile(String uuid, String originalFileName, File localFile) {
        String objectKey = format("%s/%s/%s-%s",
                bulkuploadDir,
                getOrgDirectoryName(),
                uuid,
                originalFileName
        );
        PutObjectRequest putObjectRequest = new PutObjectRequest(bucketName, objectKey, localFile);
        s3Client.putObject(putObjectRequest);
        return objectKey;
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

    private String getOrgDirectoryName() {
        String mediaDirectory = UserContextHolder.getUserContext().getOrganisation().getMediaDirectory();
        if (mediaDirectory == null) {
            logger.error("Media directory needs to be set up for the organisation.");
            throw new IllegalStateException("Information missing. Media Directory for Implementation absent");
        }
        return mediaDirectory;
    }

    private File convertMultiPartToFile(MultipartFile file) throws IOException {
        String filename = file.getOriginalFilename();
        File localFile = new File(format("%s-%s", new Date().getTime(), filename).replace(" ", "_"));
        try {
            FileOutputStream fos;
            fos = new FileOutputStream(localFile);
            fos.write(file.getBytes());
            fos.close();
        } catch (IOException e) {
            e.printStackTrace();
            throw new IOException(String.format("Unable to create temp file %s. Error: %s", filename, e.getMessage()));
        }
        return localFile;
    }

    public Resource getFileResource(String s3Key) {
        InputStream objectContent = s3Client.getObject(bucketName, s3Key).getObjectContent();
        return new InputStreamResource(objectContent);
    }

    public Reader getFileReader(String s3Key) throws IOException {
        return new InputStreamReader(getFileResource(s3Key).getInputStream());
    }
}
