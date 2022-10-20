package org.avni.server.web.external;

import com.bugsnag.Bugsnag;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.avni.server.domain.JsonObject;
import org.avni.server.util.ObjectMapperSingleton;
import org.avni.server.web.response.ExotelResponse;
import org.avni.server.web.request.ExotelRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.net.ConnectException;
import java.util.Map;

import static java.lang.String.format;

@Service
public class ExotelClient {
    private final Logger logger = LoggerFactory.getLogger(this.getClass());
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final Bugsnag bugsnag;

    @Autowired
    public ExotelClient(RestTemplateBuilder builder, Bugsnag bugsnag) {
        this.restTemplate = builder.build();
        this.bugsnag = bugsnag;
        this.objectMapper = ObjectMapperSingleton.getObjectMapper();
    }

    public ExotelResponse callMasking(JsonObject exotelConfig, ExotelRequest exotelRequest) throws ConnectException {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(exotelRequest.toMap(), headers);

        logger.debug(format("Exotel Request Body: %s", exotelRequest));

        StringBuilder url = new StringBuilder("https://")
                .append(exotelConfig.get("apiKey"))
                .append(":")
                .append(exotelConfig.get("apiToken"))
                .append("@")
                .append(exotelConfig.get("subdomain"))
                .append("/v1/Accounts/")
                .append(exotelConfig.get("accountSID"))
                .append("/Calls/connect.json");
        try {
            ResponseEntity<String> exotelResponse = restTemplate.postForEntity(url.toString(), request, String.class);
            logger.info(format("Exotel Response: Response Code: %s", exotelResponse.getStatusCode()));
            logger.debug(format("Exotel Response Body: %s", exotelResponse.getBody()));
            if (exotelResponse.getStatusCode().equals(HttpStatus.OK)) {
                return new ExotelResponse(true, "Call masking successful.");
            }
            else
                return new ExotelResponse(false, "Call masking failed.");
        } catch (HttpStatusCodeException e) {
            String baseErrorMessage = "Error while connecting the call.";
            if (e.getStatusCode() == HttpStatus.BAD_REQUEST) {
                baseErrorMessage += "This could be because you are trying to call an incorrect phone number.";
            } else {
                baseErrorMessage = getErrorMessageString(e.getResponseBodyAsString(), baseErrorMessage);
            }
            bugsnag.notify(e);
            e.printStackTrace();
            throw new ConnectException(baseErrorMessage);
        } catch (Exception e) {
            bugsnag.notify(e);
            e.printStackTrace();
            throw new ConnectException(format("Error connecting to Exotel. %s", e.getMessage()));
        }
    }

    private String getErrorMessageString(String responseBody, String baseErrorMessage) {
        if (responseBody != null) {
            try {
                Map<String, Object> responseMap = objectMapper.readValue(responseBody, new TypeReference<Map<String, Object>>() {});
                Map<String, Object> restException = objectMapper.convertValue(responseMap.get("RestException"), new TypeReference<Map<String, Object>>() {});
                String message = (String) restException.getOrDefault("Message", "");
                return format("%s %s", baseErrorMessage, message);
            } catch (JsonProcessingException e) {
                return baseErrorMessage;
            }
        }
        return baseErrorMessage;
    }
}