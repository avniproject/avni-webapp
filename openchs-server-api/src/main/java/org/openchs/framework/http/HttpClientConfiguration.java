package org.openchs.framework.http;

import org.apache.http.Header;
import org.apache.http.client.HttpClient;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.impl.conn.PoolingHttpClientConnectionManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.client.ClientHttpRequestFactory;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.web.client.ResponseErrorHandler;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.List;

@Configuration
public class HttpClientConfiguration {
    @Value("${auth.server.pool.size}")
    private Integer poolSize;

    private final ResponseErrorHandler responseErrorHandler;

    @Autowired
    public HttpClientConfiguration(ResponseErrorHandler responseErrorHandler) {
        this.responseErrorHandler = responseErrorHandler;
    }

    @Bean
    public ClientHttpRequestFactory httpRequestFactory() {
        return new HttpComponentsClientHttpRequestFactory(httpClient());
    }

    @Bean
    public RestTemplate rest() {
        RestTemplate restTemplate = new RestTemplate(httpRequestFactory());
        restTemplate.setErrorHandler(this.responseErrorHandler);
        return restTemplate;
    }

    @Bean
    public HttpClient httpClient() {
        PoolingHttpClientConnectionManager connectionManager = new PoolingHttpClientConnectionManager();
        connectionManager.setMaxTotal(poolSize);
        List<? extends Header> headers = Arrays.asList(new HttpHeader(HttpHeaders.ACCEPT, "*/*"), new HttpHeader(HttpHeaders.CONTENT_TYPE, "application/json"));
        return HttpClientBuilder
                .create()
                .setConnectionManager(connectionManager)
                .setDefaultHeaders(headers)
                .build();
    }

}
