package org.openchs.service;

import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.cognitoidp.AWSCognitoIdentityProvider;
import com.amazonaws.services.cognitoidp.AWSCognitoIdentityProviderClientBuilder;
import com.amazonaws.services.cognitoidp.model.*;
import org.openchs.domain.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;

@Service
@Profile({"default", "live", "dev", "test"})
public class CognitoIdpService {
    private final Logger logger;

    @Value("${aws.accessKeyId}")
    private String accessKeyId;

    @Value("${aws.secretAccessKey}")
    private String secretAccessKey;

    @Value("${cognito.poolid}")
    private String userPoolId;

    private Regions REGION = Regions.AP_SOUTH_1;

    private final String TEMPORARY_PASSWORD = "password";

    private AWSCognitoIdentityProvider cognitoClient;

    @Value("${openchs.connectToCognitoInDev}")
    private boolean cognitoInDevProperty;

    private Boolean isDev;

    @Autowired
    public CognitoIdpService(Boolean isDev) {
        this.isDev = isDev;
        logger = LoggerFactory.getLogger(this.getClass());
    }

    @PostConstruct
    public void init() {
        if (!isDev || cognitoInDev()) {
            cognitoClient = AWSCognitoIdentityProviderClientBuilder.standard()
                    .withCredentials(getCredentialsProvider())
                    .withRegion(REGION)
                    .build();
            logger.info("Initialized CognitoIDP client");
        }
    }

    private boolean cognitoInDev() {
        return isDev && cognitoInDevProperty;
    }

    private AWSStaticCredentialsProvider getCredentialsProvider() {
        return new AWSStaticCredentialsProvider(new BasicAWSCredentials(accessKeyId, secretAccessKey));
    }

    private AdminCreateUserRequest prepareCreateUserRequest(User user) {
        return new AdminCreateUserRequest()
                .withUserPoolId(userPoolId)
                .withUsername(user.getUsername())
                .withUserAttributes(
                    new AttributeType().withName("email").withValue(user.getEmail()),
                    new AttributeType().withName("phone_number").withValue(user.getPhoneNumber()),
                    new AttributeType().withName("email_verified").withValue("true"),
                    new AttributeType().withName("phone_number_verified").withValue("true"),
                    new AttributeType().withName("custom:userUUID").withValue(user.getUuid())
                )
                .withTemporaryPassword(TEMPORARY_PASSWORD);
    }

    public Boolean exists(User user) {
        if (isDev && !cognitoInDev()) {
            logger.info("Skipping Cognito EXISTS in dev mode...");
            return true;
        }
        try {
            cognitoClient.adminGetUser(new AdminGetUserRequest().withUserPoolId(userPoolId).withUsername(user.getUsername()));
            return true;
        } catch (UserNotFoundException e) {
            return false;
        }
    }

    public UserType createUser(User user) {
        if (isDev && !cognitoInDev()) {
            logger.info("Skipping Cognito CREATE in dev mode...");
            return null;
        }
        AdminCreateUserRequest createUserRequest = prepareCreateUserRequest(user);
        logger.info(String.format("Initiating CREATE cognito-user request | username '%s' | uuid '%s'", user.getUsername(), user.getUuid()));
        AdminCreateUserResult createUserResult =  cognitoClient.adminCreateUser(createUserRequest);
        logger.info(String.format("Created cognito-user | username '%s' | '%s'", user.getUsername(), createUserResult.toString()));
        return createUserResult.getUser();
    }

    public void createUserIfNotExists(User user) {
        if(!this.exists(user)) {
            this.createUser(user);
        }
    }

    private AdminUpdateUserAttributesRequest prepareUpdateUserRequest(User user) {
        return new AdminUpdateUserAttributesRequest()
                .withUserPoolId(userPoolId)
                .withUsername(user.getUsername())
                .withUserAttributes(
                    new AttributeType().withName("email").withValue(user.getEmail()),
                    new AttributeType().withName("phone_number").withValue(user.getPhoneNumber()),
                    new AttributeType().withName("custom:userUUID").withValue(user.getUuid())
                );
    }

    public void updateUser(User user) {
        if (isDev && !cognitoInDev()) {
            logger.info("Skipping Cognito UPDATE in dev mode...");
            return;
        }
        AdminUpdateUserAttributesRequest updateUserRequest = prepareUpdateUserRequest(user);
        logger.info(String.format("Initiating UPDATE cognito-user request | username '%s' | uuid '%s'", user.getUsername(), user.getUuid()));
        cognitoClient.adminUpdateUserAttributes(updateUserRequest);
        logger.info(String.format("Updated cognito-user | username '%s'", user.getUsername()));
    }

    public void disableUser(User user) {
        if (isDev && !cognitoInDev()) {
            logger.info("Skipping Cognito DISABLE in dev mode...");
            return;
        }
        logger.info(String.format("Initiating DISABLE cognito-user request | username '%s' | uuid '%s'", user.getUsername(), user.getUuid()));
        cognitoClient.adminDisableUser(new AdminDisableUserRequest().withUserPoolId(userPoolId).withUsername(user.getUsername()));
        logger.info(String.format("Disabled cognito-user | username '%s'", user.getUsername()));
    }

    public void deleteUser(User user) {
        if (isDev && !cognitoInDev()) {
            logger.info("Skipping Cognito DELETE in dev mode...");
            return;
        }
        logger.info(String.format("Initiating DELETE cognito-user request | username '%s' | uuid '%s'", user.getUsername(), user.getUuid()));
        cognitoClient.adminDeleteUser(new AdminDeleteUserRequest().withUserPoolId(userPoolId).withUsername(user.getUsername()));
        logger.info(String.format("Deleted cognito-user | username '%s'", user.getUsername()));
    }

    public void enableUser(User user){
        if (isDev && !cognitoInDev()) {
            logger.info("Skipping Cognito ENABLE in dev mode...");
            return;
        }
        logger.info(String.format("Initiating ENABLE cognito-user request | username '%s' | uuid '%s'", user.getUsername(), user.getUuid()));
        cognitoClient.adminEnableUser(new AdminEnableUserRequest().withUserPoolId(userPoolId).withUsername(user.getUsername()));
        logger.info(String.format("Enabled cognito-user | username '%s'", user.getUsername()));
    }

}
