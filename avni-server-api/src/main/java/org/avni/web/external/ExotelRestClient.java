package org.avni.web.external;

import org.avni.domain.JsonObject;
import org.avni.web.request.ExotelRequest;
import org.avni.web.response.ExotelResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.net.ConnectException;

import static java.lang.String.format;

@Service
public class ExotelRestClient {
    private final Logger logger = LoggerFactory.getLogger(this.getClass());
    private final RestTemplate restTemplate;

    @Autowired
    public ExotelRestClient(RestTemplateBuilder builder) {
        this.restTemplate = builder.build();
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
                return new ExotelResponse(true, "Masking call successful.");
            } else {
                logger.error(format("Error connecting for Request to Exotel: %s", exotelRequest));
                logger.error(format("Exotel Error response: %s, %s", exotelResponse.getStatusCode(), exotelResponse.getBody()));
                throw new ConnectException(format("Error connecting to Exotel. %s : %s", exotelResponse.getStatusCode(), exotelResponse.getBody()));
            }
        } catch (Exception e) {
            throw new ConnectException(format("Error connecting to Exotel. %s", e.getMessage()));
        }
    }
}
