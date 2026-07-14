package egovframework.tablet.push;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.messaging.AndroidConfig;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.MessagingErrorCode;
import egovframework.tablet.service.mapper.TabletMapper;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.List;

@Component
public class FirebasePushSender {
	private static final Logger log = LoggerFactory.getLogger(FirebasePushSender.class);
	private final TabletMapper tabletMapper;
	private final boolean configuredEnabled;
	private final String projectId;
	private volatile FirebaseMessaging firebaseMessaging;

	public FirebasePushSender(
		TabletMapper tabletMapper,
		@Value("${app.push.firebase.enabled:false}") boolean configuredEnabled,
		@Value("${app.push.firebase.project-id:}") String projectId
	) {
		this.tabletMapper = tabletMapper;
		this.configuredEnabled = configuredEnabled;
		this.projectId = projectId == null ? "" : projectId.trim();
	}

	@PostConstruct
	public void initialize() {
		if (!configuredEnabled) {
			log.info("FCM push sender is disabled. Set FCM_ENABLED=true after configuring server credentials.");
			return;
		}
		try {
			FirebaseOptions.Builder options = FirebaseOptions.builder()
				.setCredentials(GoogleCredentials.getApplicationDefault());
			if (!projectId.isEmpty()) options.setProjectId(projectId);
			FirebaseApp app = FirebaseApp.getApps().isEmpty()
				? FirebaseApp.initializeApp(options.build())
				: FirebaseApp.getInstance();
			firebaseMessaging = FirebaseMessaging.getInstance(app);
			log.info("FCM push sender initialized for project {}", projectId.isEmpty() ? "ADC default" : projectId);
		} catch (Exception e) {
			firebaseMessaging = null;
			log.error("FCM push sender initialization failed; polling remains available", e);
		}
	}

	public void send(List<String> tokens, String type, Integer rsvtSn, Long itemSn, String title, String body, String path) {
		FirebaseMessaging messaging = firebaseMessaging;
		if (messaging == null || tokens == null || tokens.isEmpty()) return;
		String itemKey = "TEACHER_CALL".equals(type) ? "callSn" : "msgSn";
		for (String token : tokens.stream().filter(value -> value != null && !value.isBlank()).distinct().toList()) {
			Message message = Message.builder()
				.setToken(token)
				.putData("type", type)
				.putData("rsvtSn", String.valueOf(rsvtSn))
				.putData(itemKey, String.valueOf(itemSn))
				.putData("title", title)
				.putData("body", body)
				.putData("path", path == null ? "" : path)
				.setAndroidConfig(AndroidConfig.builder()
					.setPriority(AndroidConfig.Priority.HIGH)
					.setTtl(Duration.ofDays(1).toMillis())
					.build())
				.build();
			try {
				messaging.send(message);
			} catch (FirebaseMessagingException e) {
				if (e.getMessagingErrorCode() == MessagingErrorCode.UNREGISTERED) {
					tabletMapper.deactivatePushDeviceByToken(token);
				}
				log.warn("FCM send failed for type {}: {}", type, e.getMessage());
			}
		}
	}
}
