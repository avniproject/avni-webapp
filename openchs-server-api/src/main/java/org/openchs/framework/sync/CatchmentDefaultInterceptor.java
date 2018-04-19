package org.openchs.framework.sync;

import org.openchs.dao.CatchmentRepository;
import org.openchs.dao.OrganisationRepository;
import org.openchs.domain.Catchment;
import org.openchs.domain.Organisation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.handler.HandlerInterceptorAdapter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.ArrayList;
import java.util.List;

@Profile({"dev"})
@Component
public class CatchmentDefaultInterceptor extends HandlerInterceptorAdapter {
    @Autowired
    private CatchmentRepository catchmentRepository;

    @Autowired
    private OrganisationRepository organisationRepository;

    @Value("${openchs.defaultOrgName}")
    private String defaultOrganisation;

    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response, Object object) throws Exception {
        if (request.getMethod().equals(RequestMethod.GET.name())) {
            List<Catchment> catchments = new ArrayList<>();
            Organisation defaultOrg = this.organisationRepository.findByName(defaultOrganisation);
            this.catchmentRepository.findAll().iterator().forEachRemaining(catchments::add);
            Catchment master = catchments.stream().filter(c -> c.getName().contains("Master") && c.getOrganisationId()
                    .equals(defaultOrg.getId())).findFirst().get();
            ((MutableRequestWrapper) request).addParameter("catchmentId", String.valueOf(master.getId()));
            ((MutableRequestWrapper) request).overrideParameter("catchmentId", String.valueOf(master.getId()));
        }
        return true;
    }
}