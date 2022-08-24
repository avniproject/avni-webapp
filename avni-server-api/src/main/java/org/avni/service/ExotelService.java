package org.avni.service;

import org.avni.dao.externalSystem.ExternalSystemConfigRepository;
import org.avni.domain.extenalSystem.ExternalSystemConfig;
import org.avni.domain.extenalSystem.SystemName;
import org.avni.framework.security.UserContextHolder;
import org.avni.web.external.ExotelRestClient;
import org.avni.web.request.ExotelRequest;
import org.avni.web.response.ExotelResponse;
import org.springframework.stereotype.Service;

import java.net.ConnectException;

@Service
public class ExotelService {

    private final ExternalSystemConfigRepository externalSystemConfigRepository;
    private final ExotelRestClient exotelRestClient;

    public ExotelService(ExternalSystemConfigRepository externalSystemConfigRepository, ExotelRestClient exotelRestClient) {
        this.externalSystemConfigRepository = externalSystemConfigRepository;
        this.exotelRestClient = exotelRestClient;
    }

    public ExotelResponse makeMaskedCall(String to) throws ConnectException {
        ExternalSystemConfig externalSystemConfig = externalSystemConfigRepository.findBySystemName(SystemName.Exotel);
        String callerId = (String) externalSystemConfig.getConfig().get("callerId");
        String from = UserContextHolder.getUser().getPhoneNumber();
        ExotelRequest exotelRequest = new ExotelRequest(from, to, callerId);

        return exotelRestClient.callMasking(externalSystemConfig.getConfig(), exotelRequest);
    }
}
