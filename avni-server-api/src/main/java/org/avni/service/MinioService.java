package org.avni.service;

import com.amazonaws.HttpMethod;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.s3.AmazonS3URI;
import io.minio.*;
import io.minio.http.Method;
import io.minio.messages.DeleteObject;
import io.minio.messages.Item;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.FilenameUtils;
import org.avni.domain.Extension;
import org.avni.domain.Organisation;
import org.avni.domain.UserContext;
import org.avni.framework.security.UserContextHolder;
import org.avni.util.AvniFiles;
import org.avni.util.S;
import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import javax.annotation.PostConstruct;
import javax.validation.constraints.NotNull;
import java.io.*;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLConnection;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import static java.lang.String.format;

@Service
@ConditionalOnProperty(
        value="s3.type",
        havingValue = "minio")
public class MinioService implements S3Service {
    public static final int MAX_KEYS = 100;
    @Value("${avni.bucketName}")
    private String bucketName;
    @Value("${minio.url}")
    private String minioUrl;

    @Value("${minio.accessKey}")
    private String minioAccessKey;

    @Value("${minio.secretAccessKey}")
    private String minioSecretAccessKey;

    @Value("${avni.connectToS3InDev}")
    private boolean s3InDev;

    private final Regions REGION = Regions.AP_SOUTH_1;
    private final int EXPIRY_DURATION = 60 * 60; //1 hour in seconds
    private final int DOWNLOAD_EXPIRY_DURATION = 2 * 60; //2 minutes in seconds
    private MinioClient minioClient;
    private final Pattern mediaDirPattern = Pattern.compile("^/?(?<mediaDir>[^/]+)/.+$");
    private final Logger logger;
    private final Boolean isDev;
    private final String EXTENSION_DIR = "extensions";
    private final String PROFILE_PIC_DIR = "profile-pics";


    @Autowired
    public MinioService(Boolean isDev) {
        this.isDev = isDev;
        logger = LoggerFactory.getLogger(MinioService.class);
    }

    @Override
    @PostConstruct
    public void init() {
        minioClient = MinioClient.builder().endpoint(minioUrl).credentials(minioAccessKey, minioSecretAccessKey).build();
        if (bucketName == null) {
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
        GetPresignedObjectUrlArgs generatePresignedUrlRequest = getPresignedObjectUrlArgsRequest(fileName, method);
        return getUrl(generatePresignedUrlRequest);
    }

    public GetPresignedObjectUrlArgs getPresignedObjectUrlArgsRequest(String fileName, HttpMethod method) {
        authorizeUser();
        String objectKey = getS3KeyForMediaUpload(fileName);
        Map<String, String> reqParams = new HashMap<String, String>();
        reqParams.put("content-type", getContentType(fileName));
        return GetPresignedObjectUrlArgs.builder().bucket(bucketName).object(objectKey).method(Method.valueOf(method.name())).extraQueryParams(reqParams).expiry(EXPIRY_DURATION).build();
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
            if (minioClient.getObject(GetObjectArgs.builder().bucket(bucketName).object(objectKey).build()).available() > 0) {
                exists = true;
            }
        } catch (Exception e) {
            logger.error(String.format("Error while accessing file %s", objectKey));
            e.printStackTrace();
        }
        logger.info(String.format("Checking for file: %s resulted in %b", objectKey, exists));
        return exists;
    }

    @Override
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

        GetPresignedObjectUrlArgs getPresignedObjectUrlArgs = GetPresignedObjectUrlArgs.builder().method(Method.DELETE).bucket(bucketName).object(objectKey).expiry(DOWNLOAD_EXPIRY_DURATION).build();
        return getUrl(getPresignedObjectUrlArgs);
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
        return format("%s/%s/%s", directory, getOrgDirectoryName(), destFileName.replace(" ", "_"));
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
        return getUrl(putObject(s3KeyForMediaUpload, tempSourceFile));
    }

    @Override
    /**
     * We are fetching a max of only 100 objects, which is different from s3 implementation,
     * which fetches all the items tll the end. This is due to the fact that,
     * Min.io does not expose a listNextBatchOfObjects() similar to what S3 does
     */ public List<Extension> listExtensionFiles(Optional<DateTime> modifiedSince) {
        if (isDev && !s3InDev) {
            return new ArrayList<>();
        }
        DateTime latestDate = modifiedSince.orElse(new DateTime(0));
        String filePrefix = getOrgDirectoryName() + "/" + EXTENSION_DIR + "/";
        List<Extension> keys = new ArrayList<>();
        Iterable<Result<Item>> objects = minioClient.listObjects(ListObjectsArgs.builder().bucket(bucketName).prefix(filePrefix).maxKeys(100).build());
        while (objects.iterator().hasNext()) {
            try {
                Item item = objects.iterator().next().get();
                if (latestDate.isBefore(item.lastModified().toEpochSecond())) {
                    keys.add(new Extension(item.objectName().replace(filePrefix, ""), new DateTime(item.lastModified().toEpochSecond())));
                }
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }
        return keys;
    }

    @Override
    public void uploadExtensionFile(File tempDirectory, String targetFilePath) throws IOException, InterruptedException {
        if (isDev && !s3InDev) {
            return;
        }

        try {
            String s3KeyForMediaUpload = getS3KeyForMediaUpload(targetFilePath);
            deleteDirectory(s3KeyForMediaUpload);
            minioClient.putObject(PutObjectArgs.builder().bucket(bucketName).object(s3KeyForMediaUpload).stream(
                    new FileInputStream(tempDirectory), 0, -1).build());
            FileUtils.forceDelete(tempDirectory);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
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
        try {
            return minioClient.getObject(GetObjectArgs.builder().bucket(bucketName).object(s3Key).build());
        } catch (Exception e) {
            e.printStackTrace();
            logger.error(format("File get content failed for  '%s'", s3Key), e);
            throw new RuntimeException(e);
        }
    }

    @Override
    public InputStream getExtensionContent(String fileName, Organisation organisation) {
        String objectKey = format("%s/%s", organisation.getMediaDirectory(), fileName);
        return getObjectContent(objectKey);
    }

    @Override
    public URL getURLForExtensions(String fileName, Organisation organisation) {
        String objectKey = format("%s/%s", organisation.getMediaDirectory(), fileName);
        GetPresignedObjectUrlArgs getPresignedObjectUrlArgs = GetPresignedObjectUrlArgs.builder().method(Method.GET).bucket(bucketName).object(objectKey).expiry(EXPIRY_DURATION).build();
        return getUrl(getPresignedObjectUrlArgs);
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
        String s3Key = format("%s/%s/%s", directory, getOrgDirectoryName(), fileName);
        try {
            return minioClient.getObject(GetObjectArgs.builder().bucket(bucketName).object(s3Key).build());
        } catch (Exception e) {
            e.printStackTrace();
            logger.error(format("File get content failed for  '%s'", s3Key), e);
            throw new RuntimeException(e);
        }
    }

    @Override
    public String uploadFileToS3(File file) throws IOException {
        return uploadFileToS3(null, file);
    }

    @Override
    public String uploadFileToS3(String parentFolder, File tempSourceFile) throws IOException {
        String suggestedS3Key = getS3KeyForMediaUpload(parentFolder, tempSourceFile.getName());
        String actualS3Key = putObject(suggestedS3Key, tempSourceFile);
        return actualS3Key;
    }

    @Override
    public void deleteObject(String objectName) {
        if (isDev && !s3InDev) {
            return;
        }
        String s3Key = getS3KeyForMediaUpload(objectName);
        try {
            minioClient.removeObject(RemoveObjectArgs.builder().bucket(bucketName).object(s3Key).build());
        } catch (Exception e) {
            e.printStackTrace();
            logger.error(format("File deletion failed for '%s'", s3Key), e);
            throw new RuntimeException(e);
        }
    }

    @Override
    public void deleteKeys(String[] keysList) {
        if (keysList == null || keysList.length == 0) {
            return;
        }
        List delObjs = Arrays.stream(keysList).map(key -> new DeleteObject(key)).collect(Collectors.toList());
        try {
            minioClient.removeObjects(RemoveObjectsArgs.builder().bucket(bucketName).objects(delObjs).build());
        } catch (Exception e) {
            e.printStackTrace();
            logger.error(format("Files deletion failed for '%s'", keysList.toString()), e);
            throw new RuntimeException(e);
        }
    }

    @Override
    public String[] getAllKeysWithPrefix(String filePrefix) {
        List keysList = new ArrayList<String>();
        Iterable<Result<Item>> objects = minioClient.listObjects(ListObjectsArgs.builder().bucket(bucketName)
                .prefix(filePrefix).maxKeys(MAX_KEYS).build());
        while (objects.iterator().hasNext()) {
            try {
                Item item = objects.iterator().next().get();
                keysList.add(item.objectName());
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }
        return (String[]) keysList.toArray();
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
            String[] txKeys = Arrays.stream(allKeys).filter(key -> metadataDirs.stream().noneMatch(key::contains)).toArray(String[]::new);
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
        try {
            minioClient.putObject(PutObjectArgs.builder().bucket(bucketName).object(objectKey).stream(new FileInputStream(tempFile), -1, -1).build());
            tempFile.delete();
            return objectKey;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public String uploadByteArray(String fileName, String extension, String objectPath, byte[] content) throws IOException {
        String mediaDirectory = getOrgDirectoryName();
        String objectKey = format("%s/%s/%s.%s", mediaDirectory, objectPath, fileName, extension);
        File tempFile = File.createTempFile(fileName, extension);
        FileOutputStream fos = new FileOutputStream(tempFile);
        fos.write(content);
        return putObject(objectKey, tempFile);
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
            String fileName = contentDisposition != null && contentDisposition.contains("filename=\"") ? contentDisposition.replaceFirst("(?i)^.*filename=\"?([^\"]+)\"?.*$", "$1") : mediaURL.substring(mediaURL.lastIndexOf("/"));

            File file = new File(format("%s/imports/%s", System.getProperty("java.io.tmpdir"), UUID.randomUUID().toString().concat(format(".%s", extractFileExtension(mediaURL, fileName)))));

            FileUtils.copyInputStreamToFile(input, file);

            return file;
        } catch (IOException e) {
            String message = format("Error while downloading media '%s' ", mediaURL);
            logger.error(message, e);
            throw new Exception(message);
        }
    }

    @NotNull
    private URL getUrl(GetPresignedObjectUrlArgs generatePresignedUrlRequest) {
        try {
            return new URL(minioClient.getPresignedObjectUrl(generatePresignedUrlRequest));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @NotNull
    private URL getUrl(String url) {
        try {
            return new URL(url);
        } catch (MalformedURLException e) {
            throw new RuntimeException(e);
        }
    }
}
