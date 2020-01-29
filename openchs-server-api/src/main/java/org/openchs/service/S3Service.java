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
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.annotation.PostConstruct;
import java.io.*;
import java.net.URL;
import java.net.URLConnection;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.Duration;
import java.util.Date;
import java.util.UUID;
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
    private Boolean isDev;

    @Autowired
    public S3Service(Boolean isDev) {
        this.isDev = isDev;
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

    public ObjectInfo uploadFile(File tempSourceFile, String destFileName, String directory) throws IOException {
        String suggestedS3Key = getS3Key(destFileName, directory);
        long noOfLines = Files.lines(Paths.get(tempSourceFile.getAbsolutePath())).count();
        String actualS3Key = putObject(suggestedS3Key, tempSourceFile);
        return new ObjectInfo(actualS3Key, noOfLines);
    }

    private String getS3Key(String destFileName, String directory) {
        return format("%s/%s/%s",
                directory,
                getOrgDirectoryName(),
                destFileName.replace(" ", "_")
        );
    }

    public ObjectInfo uploadFile(MultipartFile source, String destFileName, String directory) throws IOException {
        return uploadFile(convertMultiPartToFile(source), destFileName, directory);
    }

    public ObjectInfo uploadZipFile(MultipartFile source, String destFileName, String directory) throws IOException {
        return uploadZip(convertMultiPartToZip(source), destFileName, directory);
    }

    private ObjectInfo uploadZip(File tempSourceFile, String destFileName, String directory) throws IOException {
        String suggestedS3Key = getS3Key(destFileName, directory);
        String actualS3Key = putObject(suggestedS3Key, tempSourceFile);
        return new ObjectInfo(actualS3Key, 0L);
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

    private File convertMultiPartToZip(MultipartFile file) throws IOException {
        File tempFile = File.createTempFile(UUID.randomUUID().toString(), ".zip");
        return getFile(file, tempFile);
    }

    private File getFile(MultipartFile file, File tempFile) throws IOException {
        try {
            FileOutputStream fos;
            fos = new FileOutputStream(tempFile);
            fos.write(file.getBytes());
            fos.close();
        } catch (IOException e) {
            e.printStackTrace();
            throw new IOException(
                    format("Unable to create temp file %s. Error: %s", file.getOriginalFilename(), e.getMessage()));
        }
        return tempFile;
    }

    private File convertMultiPartToFile(MultipartFile file) throws IOException {
        File tempFile = File.createTempFile(UUID.randomUUID().toString(), ".csv");
        return getFile(file, tempFile);
    }

    private String putObject(String objectKey, File tempFile) {
        if (isDev) {
            logger.info(format("[dev] Save file locally. '%s'", objectKey));
            return tempFile.getAbsolutePath();
        }
        s3Client.putObject(new PutObjectRequest(bucketName, objectKey, tempFile));
        tempFile.delete();
        return objectKey;
    }

    public InputStream getObjectContent(String s3Key) {
        if (isDev) {
            try {
                logger.info(format("[dev] Get file locally. '%s'", s3Key));
                return new FileInputStream(s3Key);
            } catch (FileNotFoundException e) {
                e.printStackTrace();
                logger.error(format("[dev] File not found. Assume empty. '%s'", s3Key));
                return new ByteArrayInputStream(new byte[]{});
            }
        }
        return s3Client.getObject(bucketName, s3Key).getObjectContent();
    }

    public InputStream downloadFile(String directory, String fileName) {
        if (isDev) {
            String localFilePath = format("%s/%s/%s", System.getProperty("java.io.tmpdir"), directory, fileName);
            try {
                return new FileInputStream(localFilePath);
            } catch (FileNotFoundException e) {
                e.printStackTrace();
                logger.error(format("[dev] File not found. Assume empty. '%s'", fileName));
                return new ByteArrayInputStream(new byte[]{});
            }
        }
        String s3Key = format("%s/%s/%s",
                directory,
                getOrgDirectoryName(),
                fileName
        );
        return s3Client.getObject(bucketName, s3Key).getObjectContent();
    }

    public class ObjectInfo implements Serializable {
        private String key;
        private Long noOfLines;

        public ObjectInfo(String key, Long noOfLines) {
            this.key = key;
            this.noOfLines = noOfLines;
        }

        public String getKey() {
            return key;
        }

        public Long getNoOfLines() {
            return noOfLines;
        }

    }
}
