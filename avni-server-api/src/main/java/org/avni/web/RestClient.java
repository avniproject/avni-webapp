package org.avni.web;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

@Service
public class RestClient {
    @Value("${node.server.url}")
    private String NODE_SERVER_HOST;
    private Logger logger = LoggerFactory.getLogger(RestClient.class);

    public <T> String post(String api,T jsonObj,HttpHeaders httpHeaders) throws HttpClientErrorException{
        String uri = NODE_SERVER_HOST.concat(api);
        RestTemplate restTemplate = new RestTemplate();
        HttpEntity<Object> entityCredentials = new HttpEntity<>(jsonObj, httpHeaders);
        try {
            return restTemplate.postForObject(uri, entityCredentials, String.class);
        }catch (HttpClientErrorException e){
            logger.info("rule "+api+" not found");
            throw new HttpClientErrorException(HttpStatus.NOT_FOUND,"rule "+api+" not found");
        }
    }
}
