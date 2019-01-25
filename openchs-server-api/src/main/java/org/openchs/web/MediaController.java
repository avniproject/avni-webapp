package org.openchs.web;

import com.amazonaws.AmazonServiceException;
import com.amazonaws.SDKGlobalConfiguration;
import com.amazonaws.SdkClientException;
import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.auth.SystemPropertiesCredentialsProvider;
import com.amazonaws.auth.profile.ProfileCredentialsProvider;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.s3.model.*;
import org.openchs.domain.UserContext;
import org.openchs.framework.security.UserContextHolder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.io.File;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.net.HttpURLConnection;
import java.net.ProtocolException;
import java.util.ArrayList;
import java.util.Date;
import java.net.URL;
import java.util.List;

import com.amazonaws.HttpMethod;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;

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
    private int ONE_HOUR_IN_MILLIS = 1000 * 60 * 60;

    @Autowired
    public MediaController() {
        logger = LoggerFactory.getLogger(this.getClass());
    }

    @RequestMapping(value = "/media/uploadUrl/{fileName}", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    public String generateUploadUrl(@PathVariable String fileName) throws IOException {

        UserContext userContext = UserContextHolder.getUserContext();
        if (userContext == null) {
            logger.error("UserContext is null");
            return "";
        }

        String mediaDirectory = userContext.getOrganisation().getMediaDirectory();
        if (mediaDirectory == null || bucketName == null) {
            logger.error("Setup error. Media directory needs to be set up in organisation table. openchs.bucketName should be present in properties file");
            logger.error(String.format("Media directory = %s, Bucket Name = %s", bucketName, mediaDirectory));
        }

        String objectKey = String.format("%s/%s", mediaDirectory, fileName);

        AmazonS3 s3Client = AmazonS3ClientBuilder.standard()
                .withRegion(REGION)
                .withCredentials(getCredentialsProvider())
                .build();

        GeneratePresignedUrlRequest generatePresignedUrlRequest =
                new GeneratePresignedUrlRequest(bucketName, objectKey)
                        .withMethod(HttpMethod.PUT)
                        .withExpiration(getExpirationDate());
        URL url = s3Client.generatePresignedUrl(generatePresignedUrlRequest);

        logger.debug(String.format("Generating presigned url: %s", url.toString()));

        return url.toString();
    }

    private AWSStaticCredentialsProvider getCredentialsProvider() {
        return new AWSStaticCredentialsProvider(new BasicAWSCredentials(accessKeyId, secretAccessKey));
    }

    private Date getExpirationDate() {
        Date expiration = new Date();
        expiration.setTime(expiration.getTime() + ONE_HOUR_IN_MILLIS);
        return expiration;
    }
}
