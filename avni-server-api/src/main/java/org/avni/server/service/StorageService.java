package org.avni.server.service;

import com.amazonaws.HttpMethod;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.*;
import com.amazonaws.services.s3.transfer.MultipleFileUpload;
import com.amazonaws.services.s3.transfer.TransferManager;
import com.amazonaws.services.s3.transfer.TransferManagerBuilder;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.FilenameUtils;
import org.avni.server.domain.Extension;
import org.avni.server.domain.Organisation;
import org.avni.server.domain.UserContext;
import org.avni.server.framework.security.UserContextHolder;
import org.avni.server.util.AvniFiles;
import org.avni.server.util.S;
import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.net.URL;
import java.net.URLConnection;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.Duration;
import java.util.*;
import java.util.regex.Pattern;

import static java.lang.String.format;

public abstract class StorageService implements S3Service {
    protected final String bucketName;
    protected final boolean s3InDev;
    protected final Regions REGION = Regions.AP_SOUTH_1;
    protected final long EXPIRY_DURATION = Duration.ofHours(1).toMillis();
    protected final long DOWNLOAD_EXPIRY_DURATION = Duration.ofMinutes(2).toMillis();
    protected AmazonS3 s3Client;
    protected final Pattern mediaDirPattern = Pattern.compile("^/?(?<mediaDir>[^/]+)/.+$");
    protected final Logger logger;
    protected final Boolean isDev;
    protected final String EXTENSION_DIR = "extensions";
    protected final String PROFILE_PIC_DIR = "profile-pics";

    protected StorageService(String bucketName, boolean s3InDev, Logger logger, Boolean isDev) {
        this.bucketName = bucketName;
        this.s3InDev = s3InDev;
        this.logger = logger;
        this.isDev = isDev;
        if (this.bucketName == null) {
            logger.error("Setup error. avni.bucketName should be present in properties file");
            throw new IllegalStateException("Configuration missing. S3 Bucket name not configured.");
        }
    }


    @Override
    public String getContentType(String fileName) {
        return URLConnection.guessContentTypeFromName(fileName);
    }

    @Override
    public URL generateMediaUploadUrl(String fileName, HttpMethod method) {
        GeneratePresignedUrlRequest generatePresignedUrlRequest = getGeneratePresignedUrlRequest(fileName, method);
        generatePresignedUrlRequest.withContentType(getContentType(fileName));
        return s3Client.generatePresignedUrl(generatePresignedUrlRequest);
    }

    @Override
    public GeneratePresignedUrlRequest getGeneratePresignedUrlRequest(String fileName, HttpMethod method) {
        authorizeUser();
        String objectKey = getS3KeyForMediaUpload(fileName);
        return new GeneratePresignedUrlRequest(bucketName, objectKey)
                .withMethod(method)
                .withExpiration(getExpireDate(EXPIRY_DURATION));
    }

    @Override
    public String getS3KeyForMediaUpload(String fileName) {
        return getS3KeyForMediaUpload(null, fileName);
    }

    @Override
    public String getS3KeyForMediaUpload(String parentFolder, String fileName) {
        String mediaDirectory = getOrgDirectoryName();
        if (StringUtils.isEmpty(parentFolder)) {
            return format("%s/%s", mediaDirectory, fileName);
        } else {
            return format("%s/%s/%s", mediaDirectory, parentFolder, fileName);
        }
    }

    @Override
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

    @Override
    public ObjectInfo uploadFile(File tempSourceFile, String destFileName, String directory) throws IOException {
        String suggestedS3Key = getS3Key(destFileName, directory);
        long noOfLines = Files.lines(Paths.get(tempSourceFile.getAbsolutePath())).count();
        String actualS3Key = putObject(suggestedS3Key, tempSourceFile);
        return new ObjectInfo(actualS3Key, noOfLines);
    }

    @Override
    public String getS3Key(String destFileName, String directory) {
        return format("%s/%s/%s",
                directory,
                getOrgDirectoryName(),
                destFileName.replace(" ", "_")
        );
    }

    @Override
    public ObjectInfo uploadFile(MultipartFile source, String destFileName, String directory) throws IOException {
        return uploadFile(AvniFiles.convertMultiPartToFile(source, ".csv"), destFileName, directory);
    }

    @Override
    public ObjectInfo uploadZipFile(MultipartFile source, String destFileName, String directory) throws IOException {
        return uploadZip(AvniFiles.convertMultiPartToZip(source), destFileName, directory);
    }

    @Override
    public URL uploadImageFile(File tempSourceFile, String targetFilePath) {
        String s3KeyForMediaUpload = getS3KeyForMediaUpload(targetFilePath);
        putObject(s3KeyForMediaUpload, tempSourceFile);
        return s3Client.getUrl(bucketName, s3KeyForMediaUpload);
    }

    @Override
    public List<Extension> listExtensionFiles(Optional<DateTime> modifiedSince) {
        if (isDev && !s3InDev) {
            return new ArrayList<>();
        }
        DateTime latestDate = modifiedSince.orElse(new DateTime(0));
        String filePrefix = getOrgDirectoryName() + "/" + EXTENSION_DIR + "/";
        ListObjectsRequest listObjectsRequest = new ListObjectsRequest()
                .withBucketName(bucketName)
                .withPrefix(filePrefix);

        List<Extension> keys = new ArrayList<>();

        ObjectListing objects = s3Client.listObjects(listObjectsRequest);

        for (; ; ) {
            List<S3ObjectSummary> summaries = objects.getObjectSummaries();
            if (summaries.size() < 1) {
                break;
            }

            summaries.forEach(s -> {
                if (latestDate.isBefore(s.getLastModified().getTime())) {
                    keys.add(new Extension(s.getKey().replace(filePrefix, ""), new DateTime(s.getLastModified())));
                }
            });
            objects = s3Client.listNextBatchOfObjects(objects);
        }

        return keys;
    }

    @Override
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

    @Override
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

    @Override
    public InputStream getExtensionContent(String fileName, Organisation organisation) {
        String objectKey = format("%s/%s", organisation.getMediaDirectory(), fileName);
        return getObjectContent(objectKey);
    }

    @Override
    public URL getURLForExtensions(String fileName, Organisation organisation) {
        String objectKey = format("%s/%s", organisation.getMediaDirectory(), fileName);
        GeneratePresignedUrlRequest generatePresignedUrlRequest = new GeneratePresignedUrlRequest(bucketName, objectKey)
                .withMethod(HttpMethod.GET)
                .withExpiration(getExpireDate(EXPIRY_DURATION));
        return s3Client.generatePresignedUrl(generatePresignedUrlRequest);
    }

    @Override
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

    @Override
    public String uploadFileToS3(File file) throws IOException {
        return uploadFileToS3(null, file);
    }

    @Override
    public String uploadFileToS3(String parentFolder, File file) throws IOException {
//        if (!file.exists() || isDev) {
//            logger.info("Skipping media upload to S3");
//            return null;
//        }
        String s3Key = getS3KeyForMediaUpload(parentFolder, file.getName());
        s3Client.putObject(new PutObjectRequest(bucketName, s3Key, file));
        Files.delete(file.toPath());
        return getObjectURL(parentFolder, file);
    }

    @Override
    public void deleteObject(String objectName) {
        if (isDev && !s3InDev) {
            return;
        }
        String s3Key = getS3KeyForMediaUpload(objectName);
        s3Client.deleteObject(new DeleteObjectRequest(bucketName, s3Key));
    }

    @Override
    public void deleteKeys(String[] keysList) {
        DeleteObjectsRequest deleteObjectsRequest = new DeleteObjectsRequest(bucketName).withKeys(keysList);
        s3Client.deleteObjects(deleteObjectsRequest);
    }

    @Override
    public String[] getAllKeysWithPrefix(String prefix) {
        ListObjectsV2Result objectList = this.s3Client.listObjectsV2(bucketName, prefix);
        if (objectList.getKeyCount() > 0) {
            List<S3ObjectSummary> objectSummeryList = objectList.getObjectSummaries();
            String[] keysList = new String[objectSummeryList.size()];
            int count = 0;
            for (S3ObjectSummary summery : objectSummeryList) {
                keysList[count++] = summery.getKey();
            }
            return keysList;
        }
        return new String[0];
    }

    /**
     * @param prefix : prefix for which all the files will get deleted
     */
    @Override
    public void deleteDirectory(String prefix) {
        String[] keysList = this.getAllKeysWithPrefix(prefix);
        if (keysList.length > 0) {
            deleteKeys(keysList);
        }
    }

    @Override
    public void deleteOrgMedia(boolean deleteMetadata) {
        String mediaDirectory = getOrgDirectoryName();
        if (deleteMetadata) {
            this.deleteDirectory(mediaDirectory);
        } else {
            List<String> metadataDirs = Arrays.asList("icons/", "extensions/");
            String[] allKeys = getAllKeysWithPrefix(mediaDirectory);
            String[] txKeys = Arrays.stream(allKeys)
                    .filter(key -> metadataDirs.stream().noneMatch(key::contains))
                    .toArray(String[]::new);
            deleteKeys(txKeys);
        }
    }

    @Override
    public ObjectInfo uploadZip(File tempSourceFile, String destFileName, String directory) throws IOException {
        String suggestedS3Key = getS3Key(destFileName, directory);
        String actualS3Key = putObject(suggestedS3Key, tempSourceFile);
        return new ObjectInfo(actualS3Key, 0L);
    }

    @Override
    public Date getExpireDate(long expireDuration) {
        Date expiration = new Date();
        expiration.setTime(expiration.getTime() + expireDuration);
        return expiration;
    }

    @Override
    public UserContext authorizeUser() {
        UserContext userContext = UserContextHolder.getUserContext();
        if (userContext == null) {
            String message = "UserContext is null";
            throw new AccessDeniedException(message);
        }
        return userContext;
    }

    @Override
    public String getOrgDirectoryName() {
        String mediaDirectory = UserContextHolder.getUserContext().getOrganisation().getMediaDirectory();
        if (mediaDirectory == null) {
            logger.error("Media directory needs to be set up for the organisation.");
            throw new IllegalStateException("Information missing. Media Directory for Implementation absent");
        }
        return mediaDirectory;
    }

    @Override
    public String putObject(String objectKey, File tempFile) {
        if (isDev && !s3InDev) {
            logger.info(format("[dev] Save file locally. '%s'", objectKey));
            return tempFile.getAbsolutePath();
        }
        s3Client.putObject(new PutObjectRequest(bucketName, objectKey, tempFile));
        tempFile.delete();
        return objectKey;
    }

    @Override
    public String uploadByteArray(String fileName, String extension, String objectPath, byte[] content) throws IOException {
        String mediaDirectory = getOrgDirectoryName();
        String objectKey = format("%s/%s/%s.%s", mediaDirectory, objectPath, fileName, extension);
        File tempFile = File.createTempFile(fileName, extension);
        FileOutputStream fos = new FileOutputStream(tempFile);
        fos.write(content);
        putObject(objectKey, tempFile);
        return s3Client.getUrl(bucketName, objectKey).toString();
    }

    @Override
    public String getObjectURL(String parentFolder, File file) {
        String s3Key = getS3KeyForMediaUpload(parentFolder, file.getName());
        return s3Client.getUrl(bucketName, s3Key).toString();
    }

    @Override
    public String getObservationValueForUpload(String mediaURL, Object oldValue) throws Exception {
        return (mediaURL.trim().equals("")) ? null : processMediaObservation(mediaURL, oldValue);
    }

    @Override
    public String processMediaObservation(String mediaURL, Object oldValue) throws Exception {
        if (oldValue != null) {
            this.deleteObject(S.getLastStringAfter((String) oldValue, "/"));
        }
        File file = downloadMediaToFile(mediaURL);
        return this.uploadFileToS3(file);
    }

    @Override
    public String uploadProfilePic(String profilePicURL, Object oldValue) throws Exception {
        return this.uploadMediaFileInDir(PROFILE_PIC_DIR, profilePicURL, oldValue);
    }

    @Override
    public String uploadMediaFileInDir(String parentFolder, String mediaUrl, Object oldValue) throws Exception {
        if (oldValue != null) {
            this.deleteObject(S.getLastStringAfter((String) oldValue, "/"));
        }
        File file = downloadMediaToFile(mediaUrl);
        return this.uploadFileToS3(parentFolder, file);
    }

    @Override
    public String extractFileExtension(String mediaURL, String fileName) throws Exception {
        String extension = FilenameUtils.getExtension(fileName);
        if (extension.isEmpty()) {
            throw new Exception(format("No file extension found in the file name. Make sure media download URL '%s' is correct.", mediaURL));
        }
        return extension;
    }

    @Override
    public File downloadMediaToFile(String mediaURL) throws Exception {
        try {
            URLConnection connection = new URL(mediaURL).openConnection();
            connection.setConnectTimeout(5000);
            connection.setReadTimeout(5000);
            InputStream input = connection.getInputStream();

            String contentDisposition = connection.getHeaderField("Content-Disposition");
            String fileName = contentDisposition != null && contentDisposition.contains("filename=\"") ?
                    contentDisposition.replaceFirst("(?i)^.*filename=\"?([^\"]+)\"?.*$", "$1") :
                    mediaURL.substring(mediaURL.lastIndexOf("/"));

            File file = new File(format("%s/imports/%s", System.getProperty("java.io.tmpdir"),
                    UUID.randomUUID().toString().concat(format(".%s", extractFileExtension(mediaURL, fileName)))));

            FileUtils.copyInputStreamToFile(input, file);

            return file;
        } catch (IOException e) {
            String message = format("Error while downloading media '%s' ", mediaURL);
            logger.error(message, e);
            throw new Exception(message);
        }
    }
}
