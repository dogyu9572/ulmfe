package egovframework.com.security;

import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class LoginAttemptService {
	private final int maxAttempts;
	private final long lockSeconds;
	private final ConcurrentMap<String, AttemptRecord> attempts = new ConcurrentHashMap<>();

	public LoginAttemptService(
		@Value("${app.security.login-max-attempts:5}") int maxAttempts,
		@Value("${app.security.login-lock-minutes:15}") int lockMinutes) {
		this.maxAttempts = Math.max(maxAttempts, 1);
		this.lockSeconds = Math.max(lockMinutes, 1) * 60L;
	}

	public boolean isBlocked(String clientIp, String userId) {
		AttemptRecord record = attempts.get(buildKey(clientIp, userId));
		if (record == null) {
			return false;
		}
		if (record.lockedUntil != null && Instant.now().isBefore(record.lockedUntil)) {
			return true;
		}
		if (record.lockedUntil != null && Instant.now().isAfter(record.lockedUntil)) {
			attempts.remove(buildKey(clientIp, userId));
		}
		return false;
	}

	public long remainingLockSeconds(String clientIp, String userId) {
		AttemptRecord record = attempts.get(buildKey(clientIp, userId));
		if (record == null || record.lockedUntil == null) {
			return 0;
		}
		long seconds = record.lockedUntil.getEpochSecond() - Instant.now().getEpochSecond();
		return Math.max(seconds, 0);
	}

	public void loginFailed(String clientIp, String userId) {
		String key = buildKey(clientIp, userId);
		attempts.compute(key, (k, current) -> {
			AttemptRecord record = current != null ? current : new AttemptRecord();
			if (record.lockedUntil != null && Instant.now().isBefore(record.lockedUntil)) {
				return record;
			}
			record.failCount++;
			if (record.failCount >= maxAttempts) {
				record.lockedUntil = Instant.now().plusSeconds(lockSeconds);
				record.failCount = 0;
			}
			return record;
		});
	}

	public void loginSucceeded(String clientIp, String userId) {
		attempts.remove(buildKey(clientIp, userId));
	}

	private String buildKey(String clientIp, String userId) {
		String ip = clientIp == null ? "" : clientIp.trim();
		String id = userId == null ? "" : userId.trim().toLowerCase();
		return ip + "|" + id;
	}

	private static final class AttemptRecord {
		private int failCount;
		private Instant lockedUntil;
	}
}
