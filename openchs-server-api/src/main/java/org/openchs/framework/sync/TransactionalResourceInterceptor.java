package org.openchs.framework.sync;

import org.joda.time.DateTime;
import org.joda.time.format.ISODateTimeFormat;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.handler.HandlerInterceptorAdapter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.HashMap;
import java.util.Map;

@Component
public class TransactionalResourceInterceptor extends HandlerInterceptorAdapter {
    @Autowired
    private Environment environment;

    private final Map<String, Integer> nowMap = new HashMap<String, Integer>() {{
        put("live", 10);
        put("dev", 0);
        put("test", 0);
    }};

    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response, Object object) throws Exception {
        if (request.getMethod().equals(RequestMethod.GET.name())) {
            DateTime now = new DateTime();
            DateTime nowMinus10Seconds = now.minusSeconds(nowMap.get(environment.getActiveProfiles()[0]));
            ((MutableRequestWrapper) request).addParameter("now", nowMinus10Seconds.toString(ISODateTimeFormat.dateTime()));
        }
        return true;
    }
}
