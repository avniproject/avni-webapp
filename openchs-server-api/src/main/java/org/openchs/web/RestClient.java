package org.openchs.web;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.codehaus.jettison.json.JSONObject;
import org.openchs.util.ObjectMapperSingleton;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.util.Arrays;

@Service
public class RestClient {
    @Value("${node.server.url}")
    private String NODE_SERVER_HOST;

    public <T> String post(String api,T jsonObj,HttpHeaders httpHeaders) throws IOException{
        String uri = NODE_SERVER_HOST.concat(api);
        RestTemplate restTemplate = new RestTemplate();
        HttpEntity<Object> entityCredentials = new HttpEntity<>(jsonObj, httpHeaders);
        return restTemplate.postForObject( uri, entityCredentials, String.class);
    }
}