package org.avni.server.service;

import org.avni.server.dao.externalSystem.ExternalSystemConfigRepository;
import org.avni.server.domain.User;
import org.avni.server.domain.extenalSystem.ExternalSystemConfig;
import org.avni.server.domain.extenalSystem.SystemName;
import org.avni.server.framework.security.UserContextHolder;
import org.avni.server.web.external.ExotelRestClient;
import org.avni.server.web.request.ExotelRequest;
import org.avni.server.web.response.ExotelResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.ConnectException;

@Service
public class ExotelService {

    private final ExternalSystemConfigRepository externalSystemConfigRepository;
    private final ExotelRestClient exotelRestClient;

    @Value("${avni.connectToExotelInDev}")
    private boolean connectToExotelInDev;

    private boolean isDev;

    public ExotelService(boolean isDev, ExternalSystemConfigRepository externalSystemConfigRepository, ExotelRestClient exotelRestClient) {
        this.isDev = isDev;
        this.externalSystemConfigRepository = externalSystemConfigRepository;
        this.exotelRestClient = exotelRestClient;
    }

    public ExotelResponse makeMaskedCall(String to) throws ConnectException {
        if (isDev && !connectToExotelInDev) return new ExotelResponse(true, "Skipping Exotel call in dev mode.");

        ExternalSystemConfig externalSystemConfig = externalSystemConfigRepository.findBySystemName(SystemName.Exotel);
        String callerId = (String) externalSystemConfig.getConfig().get("callerId");
        User user = UserContextHolder.getUser();
        if (user == null) {
            return new ExotelResponse(false, "UserContext not found, please login and try again.");
        }
        String from = UserContextHolder.getUser().getPhoneNumber();
        ExotelRequest exotelRequest = new ExotelRequest(from, to, callerId);

        return exotelRestClient.callMasking(externalSystemConfig.getConfig(), exotelRequest);
    }
}
