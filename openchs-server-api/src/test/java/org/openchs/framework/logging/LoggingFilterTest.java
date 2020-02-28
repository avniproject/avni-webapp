package org.openchs.framework.logging;

import org.junit.Test;
import org.mockito.Mockito;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

import static org.mockito.Mockito.when;

public class LoggingFilterTest {

    //todo: This does not really test. It just logs stuff.
    //Write this better at a later point in time.
    @Test
    public void shouldLogCorrectly() throws ServletException, IOException {
        LoggingFilter loggingFilter = new LoggingFilter();

        HttpServletRequest request = Mockito.mock(HttpServletRequest.class);
        HttpServletResponse response = Mockito.mock(HttpServletResponse.class);
        FilterChain filterChain = Mockito.mock(FilterChain.class);

        when(request.getMethod()).thenReturn("GET");
        when(request.getRequestURI()).thenReturn("/avni/request/sample");
        when(request.getQueryString()).thenReturn("param1=12&param2=something");

        when(response.getStatus()).thenReturn(200);

        loggingFilter.doFilterInternal(request, response, filterChain);
    }
}