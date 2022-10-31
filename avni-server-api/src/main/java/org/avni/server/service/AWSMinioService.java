package org.avni.server.service;

import com.amazonaws.ClientConfiguration;
import com.amazonaws.HttpMethod;
import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.client.builder.AwsClientBuilder;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.model.GeneratePresignedUrlRequest;
import org.avni.server.domain.UserContext;
import org.avni.server.util.MinioUri;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.net.URL;
import java.util.regex.Matcher;

import static java.lang.String.format;

@Service("AWSMinioService")
@ConditionalOnProperty(value = "minio.s3.enable", havingValue = "true")
public class AWSMinioService extends StorageService {
    @Autowired
    public AWSMinioService(@Value("${avni.bucketName}") String bucketName,
                           @Value("${minio.url}") String minioUrl,
                           @Value("${minio.accessKey}") String minioAccessKey,
                           @Value("${minio.secretAccessKey}") String minioSecretAccessKey,
                           @Value("${avni.connectToS3InDev}") boolean s3InDev, Boolean isDev) {
        super(bucketName, s3InDev, LoggerFactory.getLogger(AWSMinioService.class), isDev);
        ClientConfiguration clientConfiguration = new ClientConfiguration();
        clientConfiguration.setSignerOverride("AWSS3V4SignerType");
        s3Client = AmazonS3ClientBuilder.standard()
                .withEndpointConfiguration(new AwsClientBuilder
                        .EndpointConfiguration(minioUrl, REGION.getName()))
                .withPathStyleAccessEnabled(true)
                .withClientConfiguration(clientConfiguration)
                .withCredentials(
                        new AWSStaticCredentialsProvider(new BasicAWSCredentials(minioAccessKey, minioSecretAccessKey)))
                .build();
    }

    @Override
    public URL generateMediaDownloadUrl(String url) {
        UserContext userContext = authorizeUser();
        String mediaDirectory = getOrgDirectoryName();

        MinioUri minioUri = new MinioUri(url);
        String objectKey = minioUri.getKey();
        Matcher matcher = mediaDirPattern.matcher(objectKey);
        String mediaDirectoryFromUrl = null;
        if (matcher.find()) {
            mediaDirectoryFromUrl = matcher.group("mediaDir");
        }
        if (!mediaDirectory.equals(mediaDirectoryFromUrl) || !(bucketName.equals(minioUri.getBucket()))) {
            String message = format("User '%s' not authorized to access '%s'", userContext.getUserName(), url);
            throw new AccessDeniedException(message);
        }

        GeneratePresignedUrlRequest generatePresignedUrlRequest = new GeneratePresignedUrlRequest(bucketName, objectKey)
                .withMethod(HttpMethod.GET).withExpiration(getExpireDate(DOWNLOAD_EXPIRY_DURATION));
        return s3Client.generatePresignedUrl(generatePresignedUrlRequest);
    }
}
