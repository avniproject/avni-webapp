package org.avni.server.service;

import org.springframework.stereotype.Service;

import javax.crypto.*;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.security.*;
import java.util.Base64;

@Service
public class CryptoService {
    private static final String ENCRYPT_ALGO = "AES/GCM/NoPadding";
    private static final String ALGO = "AES";
    private static final int TAG_LENGTH_BIT = 128;
    private static final int IV_LENGTH_BYTE = 16;

    private byte[] getRandomNonce() {
        byte[] nonce = new byte[IV_LENGTH_BYTE];
        new SecureRandom().nextBytes(nonce);
        return nonce;
    }

    public byte[] decodeFromBase64(String base64EncodedString) {
        return Base64.getDecoder().decode(base64EncodedString);
    }

    public String encodeToBase64(byte[] valueToEncode) {
        return Base64.getEncoder().encodeToString(valueToEncode);
    }

    private SecretKey getSecretKey(String base64EncodedKey) {
        byte[] decodedKey = decodeFromBase64(base64EncodedKey);
        return new SecretKeySpec(decodedKey, 0, decodedKey.length, ALGO);
    }

    private byte[] encrypt(byte[] plainText, SecretKey secretKey, byte[] iv) throws NoSuchPaddingException, NoSuchAlgorithmException, InvalidAlgorithmParameterException, InvalidKeyException, BadPaddingException, IllegalBlockSizeException {
        Cipher cipher = Cipher.getInstance(ENCRYPT_ALGO);
        cipher.init(Cipher.ENCRYPT_MODE, secretKey, new GCMParameterSpec(TAG_LENGTH_BIT, iv));
        return cipher.doFinal(plainText);
    }

    public byte[] encryptWithIVPrefixed(byte[] plainText, String base64EncodedKey) throws GeneralSecurityException {
        byte[] iv = getRandomNonce();
        SecretKey secretKey = getSecretKey(base64EncodedKey);
        byte[] cipherText = encrypt(plainText, secretKey, iv);
        return ByteBuffer.allocate(iv.length + cipherText.length)
                .put(iv)
                .put(cipherText)
                .array();
    }

    private byte[] decrypt(byte[] cipherText, SecretKey secretKey, byte[] iv)  throws NoSuchPaddingException, NoSuchAlgorithmException, InvalidAlgorithmParameterException, InvalidKeyException, BadPaddingException, IllegalBlockSizeException {
        Cipher cipher = Cipher.getInstance(ENCRYPT_ALGO);
        cipher.init(Cipher.DECRYPT_MODE, secretKey, new GCMParameterSpec(TAG_LENGTH_BIT, iv));
        return cipher.doFinal(cipherText);
    }

    public byte[] decryptWithIVPrefixed(byte[] cipherText, String base64EncodedKey) throws GeneralSecurityException {
        SecretKey secretKey = getSecretKey(base64EncodedKey);
        ByteBuffer bb = ByteBuffer.wrap(cipherText);
        byte[] iv = new byte[IV_LENGTH_BYTE];
        bb.get(iv);
        byte[] cText = new byte[bb.remaining()];
        bb.get(cText);
        return decrypt(cText, secretKey, iv);
    }

}
