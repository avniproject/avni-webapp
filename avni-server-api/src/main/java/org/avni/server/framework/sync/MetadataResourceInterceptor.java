package org.avni.server.framework.sync;

import org.avni.server.domain.User;
import org.avni.server.framework.security.UserContextHolder;
import org.joda.time.DateTime;
import org.joda.time.format.ISODateTimeFormat;
import org.avni.server.util.UserUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.handler.HandlerInterceptorAdapter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@Component
public class MetadataResourceInterceptor extends HandlerInterceptorAdapter {

    private UserUtil userUtil;

    @Autowired
    public MetadataResourceInterceptor(UserUtil userUtil) {
        this.userUtil = userUtil;
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
            ((MutableRequestWrapper) request).addParameter("catchmentId", String.valueOf(userUtil.getCatchmentId()));
        }
        return true;
    }

}
