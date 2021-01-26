package org.openchs.web.external;

import org.openchs.web.request.Msg91Request;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.HashMap;

import static java.lang.String.format;

@Service
public class Msg91RestClient {
    @Value("${msg91.server.url}")
    private String MSG91_SERVER_HOST;
    private final Logger logger = LoggerFactory.getLogger(this.getClass());
    private final RestTemplate restTemplate;

    @Autowired
    public Msg91RestClient(RestTemplateBuilder builder) {
        this.restTemplate = builder.build();
    }

    public String callAPI(HttpMethod method, String url, Msg91Request msg91Request) {
        HttpHeaders headers = new HttpHeaders();
        if (method == HttpMethod.POST) {
            headers.setContentType(MediaType.APPLICATION_JSON);
        }
        headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
        HttpEntity<Object> request = new HttpEntity<>(headers);
        logger.info(format("Request to Msg91: %s, %s, %s", method, url, msg91Request));
        ResponseEntity<String> msg91ResponseResponse = restTemplate.exchange(MSG91_SERVER_HOST.concat(url), method, request, String.class, msg91Request.toMap());
        logger.info(format("Response from Msg91: %s, %s", msg91ResponseResponse.getStatusCode(), msg91ResponseResponse.getBody()));
        if (msg91ResponseResponse.getStatusCode() == HttpStatus.OK) {
            return msg91ResponseResponse.getBody();
        } else {
            //handle exceptions
            return null;
        }
    }
}
