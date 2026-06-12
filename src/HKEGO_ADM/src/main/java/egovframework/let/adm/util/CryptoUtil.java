package egovframework.let.adm.util;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Component
public class CryptoUtil {
	private static final String ALGORITHM = "AES";
	private static final String TRANSFORMATION = "AES/ECB/PKCS5Padding";
	private static final int AES_256_KEY_LENGTH = 32;

	@Value("${app.crypto.secret-key}")
	private String secretKey;

	@PostConstruct
	public void validateSecretKey() {
		if (secretKey == null || secretKey.length() != AES_256_KEY_LENGTH) {
			throw new IllegalStateException("app.crypto.secret-key must be exactly 32 characters.");
		}
	}

	public String encrypt(String plainText) {
		if (plainText == null || plainText.trim().isEmpty()) {
			return plainText;
		}
		try {
			SecretKeySpec secretKeySpec = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), ALGORITHM);
			Cipher cipher = Cipher.getInstance(TRANSFORMATION);
			cipher.init(Cipher.ENCRYPT_MODE, secretKeySpec);
			byte[] encryptedBytes = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));
			return Base64.getEncoder().encodeToString(encryptedBytes);
		} catch (Exception e) {
			throw new RuntimeException("암호화 실패", e);
		}
	}

	public String decrypt(String encryptedText) {
		if (encryptedText == null || encryptedText.trim().isEmpty()) {
			return encryptedText;
		}
		try {
			SecretKeySpec secretKeySpec = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), ALGORITHM);
			Cipher cipher = Cipher.getInstance(TRANSFORMATION);
			cipher.init(Cipher.DECRYPT_MODE, secretKeySpec);
			byte[] decodedBytes = Base64.getDecoder().decode(encryptedText);
			byte[] decryptedBytes = cipher.doFinal(decodedBytes);
			return new String(decryptedBytes, StandardCharsets.UTF_8);
		} catch (Exception e) {
			throw new RuntimeException("복호화 실패", e);
		}
	}

	public boolean isEncrypted(String text) {
		if (text == null || text.trim().isEmpty()) {
			return false;
		}
		try {
			Base64.getDecoder().decode(text);
			SecretKeySpec secretKeySpec = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), ALGORITHM);
			Cipher cipher = Cipher.getInstance(TRANSFORMATION);
			cipher.init(Cipher.DECRYPT_MODE, secretKeySpec);
			byte[] decodedBytes = Base64.getDecoder().decode(text);
			cipher.doFinal(decodedBytes);
			return true;
		} catch (Exception e) {
			return false;
		}
	}

	public String safeDecrypt(String text) {
		if (text == null || text.trim().isEmpty()) {
			return text;
		}
		if (isEncrypted(text)) {
			return decrypt(text);
		}
		return text;
	}
}
