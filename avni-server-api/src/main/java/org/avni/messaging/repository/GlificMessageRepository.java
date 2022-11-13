package org.avni.messaging.repository;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.avni.messaging.contract.glific.GlificMessageResponse;
import org.avni.messaging.contract.glific.GlificResponse;
import org.avni.messaging.external.GlificRestClient;
import org.avni.server.util.ObjectMapperSingleton;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Repository;

import java.io.IOException;

@Repository
public class GlificMessageRepository {
    private final GlificRestClient glificRestClient;
    private final String SEND_HSM_MESSAGE_JSON;

    public GlificMessageRepository(GlificRestClient glificRestClient) {
        this.glificRestClient = glificRestClient;
        try {
            SEND_HSM_MESSAGE_JSON = ObjectMapperSingleton.getObjectMapper().readTree(this.getClass().getResource("/external/glific/sendHsmMessage.json")).toString();
        } catch (IOException ioException) {
            throw new RuntimeException(ioException);
        }
    }

    public GlificMessageResponse sendMessage(String messageTemplateId, String externalId, String[] parameters ) {
        String message = SEND_HSM_MESSAGE_JSON.replace("\"${templateId}\"", messageTemplateId)
                .replace("\"${receiverId}\"", externalId)
                .replace("\"${parameters}\"", arrayToString(parameters));
        return glificRestClient.callAPI(message,new ParameterizedTypeReference<GlificResponse<GlificMessageResponse>>() {});
    }

    public String arrayToString(String[] items) {
        StringBuffer result = new StringBuffer();
        result.append("[");
        for (String item : items) {
            result.append("\"");
            result.append(item);
            result.append("\",");
        }
        result.deleteCharAt(result.length() - 1);
        result.append("]");
        return result.toString();
    }
}
