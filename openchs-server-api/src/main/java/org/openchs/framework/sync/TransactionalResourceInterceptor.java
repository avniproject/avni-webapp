package org.openchs.framework.sync;

import org.joda.time.DateTime;
import org.joda.time.format.ISODateTimeFormat;
import org.openchs.domain.Catchment;
import org.openchs.domain.UserContext;
import org.openchs.framework.security.UserContextHolder;
import org.springframework.beans.factory.annotation.Autowired;
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
    private static final int DEFAULT_CATCHMENT_ID_FOR_DEV = 1;
    private final Environment environment;

    private final Map<String, Integer> nowMap = new HashMap<String, Integer>() {{
        put("live", 10);
    }};

    @Autowired
    public TransactionalResourceInterceptor(Environment environment) {
        this.environment = environment;
    }

    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response, Object object) throws Exception {
        if (request.getMethod().equals(RequestMethod.GET.name())) {
            DateTime now = new DateTime();
            DateTime nowMinus10Seconds = now.minusSeconds(nowMap.getOrDefault(environment.getActiveProfiles()[0], 0));
            ((MutableRequestWrapper) request).addParameter("now", nowMinus10Seconds.toString(ISODateTimeFormat.dateTime()));
            Long catchmentId = getCatchmentId();
            ((MutableRequestWrapper) request).addParameter("catchmentId", catchmentId.toString());
        }
        return true;
    }

    private Long getCatchmentId() {
        UserContext userContext = UserContextHolder.getUserContext();
        Catchment catchment = userContext.getUser().getCatchment();
        return (isDev() && catchment == null) ? DEFAULT_CATCHMENT_ID_FOR_DEV : catchment.getId();
    }

    private boolean isDev() {
        String[] activeProfiles = environment.getActiveProfiles();
        return activeProfiles.length == 1 && (activeProfiles[0].equals("dev") || activeProfiles[0].equals("test"));
    }

}
