package org.openchs.framework.sync;

import org.joda.time.DateTime;
import org.joda.time.format.ISODateTimeFormat;
import org.openchs.domain.User;
import org.openchs.framework.security.UserContextHolder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.handler.HandlerInterceptorAdapter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@Component
public class MetadataResourceInterceptor extends HandlerInterceptorAdapter {

    private final Long catchmentId;

    @Autowired
    public MetadataResourceInterceptor(Long catchmentId) {
        this.catchmentId = catchmentId;
    }

    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response, Object object) throws Exception {
        if (request.getMethod().equals(RequestMethod.GET.name())) {
            ((MutableRequestWrapper) request).addParameter("now", new DateTime().toString(ISODateTimeFormat.dateTime()));
            User user = UserContextHolder.getUser();
            if (user == null) {
                response.sendError(HttpServletResponse.SC_FORBIDDEN, "User not available from UserContext. Check for Auth errors");
                return false;
            }
            ((MutableRequestWrapper) request).addParameter("catchmentId", String.valueOf(catchmentId));
        }
        return true;
    }

}
