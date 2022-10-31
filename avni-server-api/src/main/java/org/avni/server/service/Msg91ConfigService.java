package org.avni.server.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;


@Service
public class Msg91ConfigService {
    @Value("${avni.msg91.authKey.base64EncodedEncryptionKey}")
    private String base64EncodedAuthKeyEncryptionKey;
    private CryptoService cryptoService;

    @Autowired
    public Msg91ConfigService(CryptoService cryptoService) {
        this.cryptoService = cryptoService;
    }

    public String encryptAuthKey(String authKey) throws GeneralSecurityException {
        byte[] encryptedValue = cryptoService.encryptWithIVPrefixed(authKey.getBytes(StandardCharsets.UTF_8), base64EncodedAuthKeyEncryptionKey);
        return cryptoService.encodeToBase64(encryptedValue);
    }

    public String decryptAuthKey(String encryptedAuthKey) throws GeneralSecurityException {
        return new String(cryptoService.decryptWithIVPrefixed(cryptoService.decodeFromBase64(encryptedAuthKey), base64EncodedAuthKeyEncryptionKey), StandardCharsets.UTF_8);
    }

    public String maskAuthKey(String authKey) {
        return authKey.replaceAll(".(?=.{4})", "X");
    }
}
