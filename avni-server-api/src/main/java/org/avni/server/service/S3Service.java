package org.avni.server.service;

import com.amazonaws.HttpMethod;
import com.amazonaws.services.s3.model.GeneratePresignedUrlRequest;
import org.avni.server.domain.Extension;
import org.avni.server.domain.Organisation;
import org.avni.server.domain.UserContext;
import org.joda.time.DateTime;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.util.Date;
import java.util.List;
import java.util.Optional;

public interface S3Service {

    String getContentType(String fileName);

    URL generateMediaUploadUrl(String fileName, HttpMethod method);

    GeneratePresignedUrlRequest getGeneratePresignedUrlRequest(String fileName, HttpMethod method);

    String getS3KeyForMediaUpload(String fileName);

    String getS3KeyForMediaUpload(String parentFolder, String fileName);

    boolean fileExists(String fileName);

    URL generateMediaDownloadUrl(String url);

    ObjectInfo uploadFile(File tempSourceFile, String destFileName, String directory) throws IOException;

    String getS3Key(String destFileName, String directory);

    ObjectInfo uploadFile(MultipartFile source, String destFileName, String directory) throws IOException;

    ObjectInfo uploadZipFile(MultipartFile source, String destFileName, String directory) throws IOException;

    URL uploadImageFile(File tempSourceFile, String targetFilePath);

    List<Extension> listExtensionFiles(Optional<DateTime> modifiedSince);

    void uploadExtensionFile(File tempDirectory, String targetFilePath) throws IOException, InterruptedException;

    InputStream getObjectContent(String s3Key);

    InputStream getExtensionContent(String fileName, Organisation organisation);

    URL getURLForExtensions(String fileName, Organisation organisation);

    InputStream downloadFile(String directory, String fileName);

    String uploadFileToS3(File file) throws IOException;

    String uploadFileToS3(String parentFolder, File file) throws IOException;

    void deleteObject(String objectName);

    void deleteKeys(String[] keysList);

    String[] getAllKeysWithPrefix(String prefix);

    void deleteDirectory(String prefix);

    void deleteOrgMedia(boolean deleteMetadata);

    ObjectInfo uploadZip(File tempSourceFile, String destFileName, String directory) throws IOException;

    Date getExpireDate(long expireDuration);

    UserContext authorizeUser();

    String getOrgDirectoryName();

    String putObject(String objectKey, File tempFile);

    String uploadByteArray(String fileName, String extension, String objectPath, byte[] content) throws IOException;

    String getObjectURL(String parentFolder, File file);

    String getObservationValueForUpload(String mediaURL, Object oldValue) throws Exception;

    String processMediaObservation(String mediaURL, Object oldValue) throws Exception;

    String uploadProfilePic(String profilePicURL, Object oldValue) throws Exception;

    String uploadMediaFileInDir(String parentFolder, String mediaUrl, Object oldValue) throws Exception;

    String extractFileExtension(String mediaURL, String fileName) throws Exception;

    File downloadMediaToFile(String mediaURL) throws Exception;
}
