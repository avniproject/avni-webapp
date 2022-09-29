package org.avni.server.service;

import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.cognitoidp.AWSCognitoIdentityProvider;
import com.amazonaws.services.cognitoidp.AWSCognitoIdentityProviderClientBuilder;
import com.amazonaws.services.cognitoidp.model.*;
import org.avni.server.domain.User;
import org.avni.server.util.S;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;

@Service("CognitoIdpService")
@ConditionalOnProperty(value = "aws.cognito.enable", havingValue = "true", matchIfMissing = true)
public class CognitoIdpService extends IdpServiceImpl {

    @Value("${aws.accessKeyId}")
    private String accessKeyId;

    @Value("${aws.secretAccessKey}")
    private String secretAccessKey;

    @Value("${cognito.poolid}")
    private String userPoolId;

    private Regions REGION = Regions.AP_SOUTH_1;

    private AWSCognitoIdentityProvider cognitoClient;

    @Value("${avni.connectToCognitoInDev}")
    private boolean cognitoInDevProperty;

    @Autowired
    public CognitoIdpService(Boolean isDev) {
        super(isDev);
    }

    @PostConstruct
    public void init() {
        if (!isDev || this.idpInDev()) {
            cognitoClient = AWSCognitoIdentityProviderClientBuilder.standard()
                    .withCredentials(getCredentialsProvider())
                    .withRegion(REGION)
                    .build();
            logger.info("Initialized CognitoIDP client");
        }
    }
    @Override
    public void createUser(User user) {
        if (isDev && !this.idpInDev()) {
            logger.info("Skipping Cognito CREATE in dev mode...");
            return;
        }
        AdminCreateUserRequest createUserRequest = prepareCreateUserRequest(user, TEMPORARY_PASSWORD);
        createCognitoUser(createUserRequest, user);
    }
    @Override
    public void createUserWithPassword(User user, String password) {
        if (isDev && !idpInDev()) {
            logger.info("Skipping Cognito CREATE in dev mode...");
            return;
        }
        boolean isTmpPassword = S.isEmpty(password);
        AdminCreateUserRequest createUserRequest = prepareCreateUserRequest(user, isTmpPassword ? TEMPORARY_PASSWORD : password);
        createCognitoUser(createUserRequest, user);
        if (!isTmpPassword) {
            resetPassword(user, password);
        }
    }
    @Override
    public void updateUser(User user) {
        if (isDev && !idpInDev()) {
            logger.info("Skipping Cognito UPDATE in dev mode...");
            return;
        }
        AdminUpdateUserAttributesRequest updateUserRequest = prepareUpdateUserRequest(user);
        logger.info(String.format("Initiating UPDATE cognito-user request | username '%s' | uuid '%s'", user.getUsername(), user.getUuid()));
        cognitoClient.adminUpdateUserAttributes(updateUserRequest);
        logger.info(String.format("Updated cognito-user | username '%s'", user.getUsername()));
    }
    @Override
    public void disableUser(User user) {
        if (isDev && !idpInDev()) {
            logger.info("Skipping Cognito DISABLE in dev mode...");
            return;
        }
        logger.info(String.format("Initiating DISABLE cognito-user request | username '%s' | uuid '%s'", user.getUsername(), user.getUuid()));
        cognitoClient.adminDisableUser(new AdminDisableUserRequest().withUserPoolId(userPoolId).withUsername(user.getUsername()));
        logger.info(String.format("Disabled cognito-user | username '%s'", user.getUsername()));
    }
    @Override
    public void deleteUser(User user) {
        if (isDev && !idpInDev()) {
            logger.info("Skipping Cognito DELETE in dev mode...");
            return;
        }
        logger.info(String.format("Initiating DELETE cognito-user request | username '%s' | uuid '%s'", user.getUsername(), user.getUuid()));
        cognitoClient.adminDeleteUser(new AdminDeleteUserRequest().withUserPoolId(userPoolId).withUsername(user.getUsername()));
        logger.info(String.format("Deleted cognito-user | username '%s'", user.getUsername()));
    }
    @Override
    public void enableUser(User user) {
        if (isDev && !idpInDev()) {
            logger.info("Skipping Cognito ENABLE in dev mode...");
            return;
        }
        logger.info(String.format("Initiating ENABLE cognito-user request | username '%s' | uuid '%s'", user.getUsername(), user.getUuid()));
        cognitoClient.adminEnableUser(new AdminEnableUserRequest().withUserPoolId(userPoolId).withUsername(user.getUsername()));
        logger.info(String.format("Enabled cognito-user | username '%s'", user.getUsername()));
    }
    @Override
    public void resetPassword(User user, String password) {
        if (isDev && !idpInDev()) {
            logger.info("Skipping Cognito reset password in dev mode...");
            return;
        }
        logger.info(String.format("Initiating reset password cognito-user request | username '%s' | uuid '%s'", user.getUsername(), user.getUuid()));
        AdminSetUserPasswordRequest adminSetUserPasswordRequest = new AdminSetUserPasswordRequest()
                .withUserPoolId(userPoolId)
                .withUsername(user.getUsername())
                .withPassword(password)
                .withPermanent(true);
        cognitoClient.adminSetUserPassword(adminSetUserPasswordRequest);
        logger.info(String.format("password reset for cognito-user | username '%s'", user.getUsername()));
    }
    @Override
    public boolean idpInDev() {
        return isDev && cognitoInDevProperty;
    }
    @Override
    public Boolean existsInIDP(User user) {
        try {
            cognitoClient.adminGetUser(new AdminGetUserRequest().withUserPoolId(userPoolId).withUsername(user.getUsername()));
            return true;
        } catch (UserNotFoundException e) {
            return false;
        }
    }
    private AWSStaticCredentialsProvider getCredentialsProvider() {
        return new AWSStaticCredentialsProvider(new BasicAWSCredentials(accessKeyId, secretAccessKey));
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
    private AdminCreateUserRequest prepareCreateUserRequest(User user, String password) {
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
                .withTemporaryPassword(password);
    }
    private UserType createCognitoUser(AdminCreateUserRequest createUserRequest, User user) {
        logger.info(String.format("Initiating CREATE cognito-user request | username '%s' | uuid '%s'", user.getUsername(), user.getUuid()));
        AdminCreateUserResult createUserResult =  cognitoClient.adminCreateUser(createUserRequest);
        logger.info(String.format("Created cognito-user | username '%s' | '%s'", user.getUsername(), createUserResult.toString()));
        return createUserResult.getUser();
    }
}
