package org.openchs.service;

import com.amazonaws.HttpMethod;
import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.AmazonS3URI;
import com.amazonaws.services.s3.model.*;
import com.amazonaws.services.s3.transfer.MultipleFileUpload;
import com.amazonaws.services.s3.transfer.TransferManager;
import com.amazonaws.services.s3.transfer.TransferManagerBuilder;
import org.apache.commons.io.FileUtils;
import org.openchs.domain.Organisation;
import org.openchs.domain.UserContext;
import org.openchs.framework.security.UserContextHolder;
import org.openchs.util.AvniFiles;
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
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static java.lang.String.format;

@Service
public class S3Service {
    @Value("${openchs.bucketName}")
    private String bucketName;

    @Value("${aws.accessKeyId}")
    private String accessKeyId;

    @Value("${aws.secretAccessKey}")
    private String secretAccessKey;

    @Value("${openchs.connectToS3InDev}")
    private boolean s3InDev;

    private final Regions REGION = Regions.AP_SOUTH_1;
    private final long EXPIRY_DURATION = Duration.ofHours(1).toMillis();
    private final long DOWNLOAD_EXPIRY_DURATION = Duration.ofMinutes(2).toMillis();
    private AmazonS3 s3Client;
    private final Pattern mediaDirPattern = Pattern.compile("^/?(?<mediaDir>[^/]+)/.+$");
    private final Logger logger;
    private final Boolean isDev;

    @Autowired
    public S3Service(Boolean isDev) {
        this.isDev = isDev;
        logger = LoggerFactory.getLogger(S3Service.class);
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

    public URL generateMediaUploadUrl(String fileName, HttpMethod method) {
        GeneratePresignedUrlRequest generatePresignedUrlRequest = getGeneratePresignedUrlRequest(fileName, method);
        generatePresignedUrlRequest.withContentType(getContentType(fileName));
        return s3Client.generatePresignedUrl(generatePresignedUrlRequest);
    }

    private GeneratePresignedUrlRequest getGeneratePresignedUrlRequest(String fileName, HttpMethod method) {
        authorizeUser();
        String objectKey = getS3KeyForMediaUpload(fileName);
        return new GeneratePresignedUrlRequest(bucketName, objectKey)
                .withMethod(method)
                .withExpiration(getExpireDate(EXPIRY_DURATION));
    }

    private String getS3KeyForMediaUpload(String fileName) {
        String mediaDirectory = getOrgDirectoryName();
        return format("%s/%s", mediaDirectory, fileName);
    }

    public boolean fileExists(String fileName) {
        authorizeUser();
        String objectKey = getS3KeyForMediaUpload(fileName);
        boolean exists = false;
        try {
            exists = s3Client.doesObjectExist(bucketName, objectKey);
            logger.info(String.format("Checking for file: %s resulted in %b", objectKey, exists));
        } catch (Exception e) {
            logger.error(String.format("Error while accessing file %s", objectKey));
            e.printStackTrace();
        }
        return exists;
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
        return uploadFile(AvniFiles.convertMultiPartToFile(source, ".csv"), destFileName, directory);
    }

    public ObjectInfo uploadZipFile(MultipartFile source, String destFileName, String directory) throws IOException {
        return uploadZip(AvniFiles.convertMultiPartToZip(source), destFileName, directory);
    }

    public URL uploadImageFile(File tempSourceFile, String targetFilePath) {
        String s3KeyForMediaUpload = getS3KeyForMediaUpload(targetFilePath);
        putObject(s3KeyForMediaUpload, tempSourceFile);
        return s3Client.getUrl(bucketName, s3KeyForMediaUpload);
    }

    public void uploadExtensionFile(File tempDirectory, String targetFilePath) throws IOException, InterruptedException {
        if (isDev && !s3InDev) {
            return;
        }
        String s3KeyForMediaUpload = getS3KeyForMediaUpload(targetFilePath);
        deleteDirectory(s3KeyForMediaUpload);
        TransferManager transferManager = TransferManagerBuilder.standard().withS3Client(s3Client).build();
        MultipleFileUpload multipleFileUpload = transferManager.uploadDirectory(bucketName, s3KeyForMediaUpload, tempDirectory, true);
        multipleFileUpload.waitForCompletion();
        FileUtils.forceDelete(tempDirectory);
    }

    /**
     * @param prefix : prefix for which all the files will get deleted
     */
    private void deleteDirectory(String prefix) {
        ListObjectsV2Result objectList = this.s3Client.listObjectsV2(bucketName, prefix);
        if (objectList.getKeyCount() > 0) {
            List<S3ObjectSummary> objectSummeryList = objectList.getObjectSummaries();
            String[] keysList = new String[objectSummeryList.size()];
            int count = 0;
            for (S3ObjectSummary summery : objectSummeryList) {
                keysList[count++] = summery.getKey();
            }
            DeleteObjectsRequest deleteObjectsRequest = new DeleteObjectsRequest(bucketName).withKeys(keysList);
            s3Client.deleteObjects(deleteObjectsRequest);
        }
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

    private String putObject(String objectKey, File tempFile) {
        if (isDev && !s3InDev) {
            logger.info(format("[dev] Save file locally. '%s'", objectKey));
            return tempFile.getAbsolutePath();
        }
        s3Client.putObject(new PutObjectRequest(bucketName, objectKey, tempFile));
        tempFile.delete();
        return objectKey;
    }

    public InputStream getObjectContent(String s3Key) {
        if (isDev && !s3InDev) {
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

    public InputStream getExtensionContent(String fileName, Organisation organisation) {
        String objectKey = format("%s/%s", organisation.getMediaDirectory(), fileName);
        return getObjectContent(objectKey);
    }

    public InputStream downloadFile(String directory, String fileName) {
        if (isDev && !s3InDev) {
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

    public String uploadFileToS3(File file) throws IOException {
        if (!file.exists() || isDev) {
            logger.info("Skipping media upload to S3");
            return null;
        }
        String s3Key = getS3KeyForMediaUpload(file.getName());
        s3Client.putObject(new PutObjectRequest(bucketName, s3Key, file));
        Files.delete(file.toPath());
        return getObjectURL(file);
    }

    public void deleteObject(String objectName) {
        if (isDev && !s3InDev) {
            return;
        }
        String s3Key = getS3KeyForMediaUpload(objectName);
        s3Client.deleteObject(new DeleteObjectRequest(bucketName, s3Key));
    }

    private String getObjectURL(File file) {
        String s3Key = getS3KeyForMediaUpload(file.getName());
        return s3Client.getUrl(bucketName, s3Key).toString();
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
