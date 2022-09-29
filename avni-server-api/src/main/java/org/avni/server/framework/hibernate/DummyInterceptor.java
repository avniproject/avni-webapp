package org.avni.server.framework.hibernate;

import org.avni.server.dao.GenderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.transaction.Transactional;

@Component
/**
 * Hack. Ensure a transactional data query is made at the end of a web request so that all dirty objects are flushed out.
 * Somehow, changing flush mode does not seem to fix the problem, so manually doing a query here.
 */
public class DummyInterceptor implements HandlerInterceptor {

    private GenderRepository genderRepository;

    @Autowired
    public DummyInterceptor(GenderRepository genderRepository) {
        this.genderRepository = genderRepository;
    }

    @Override
    public boolean preHandle(
            HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {

        return true;
    }

    @Override
    @Transactional
    public void postHandle(
            HttpServletRequest request, HttpServletResponse response, Object handler,
            ModelAndView modelAndView) throws Exception {
        genderRepository.findAll();
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response,
                                Object handler, Exception exception) throws Exception {
    }
}
