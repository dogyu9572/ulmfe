package egovframework.tablet.service;

import egovframework.tablet.push.FirebasePushSender;
import egovframework.tablet.service.mapper.TabletMapper;
import egovframework.tablet.service.vo.TabletPushDeviceRequest;
import egovframework.tablet.service.vo.TabletPushDeviceResponse;
import egovframework.tablet.service.vo.TabletPushDeviceVO;
import egovframework.tablet.service.vo.TabletStudentVO;
import egovframework.tablet.service.vo.TabletTeacherCallVO;
import egovframework.tablet.service.vo.TabletTeacherMessageVO;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.task.TaskExecutor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
public class TabletPushServiceImpl implements TabletPushService {
	private static final ZoneId SERVICE_ZONE = ZoneId.of("Asia/Seoul");
	private final TabletMapper tabletMapper;
	private final FirebasePushSender firebasePushSender;
	private final TaskExecutor taskExecutor;

	public TabletPushServiceImpl(
		TabletMapper tabletMapper,
		FirebasePushSender firebasePushSender,
		@Qualifier("tabletPushTaskExecutor") TaskExecutor taskExecutor
	) {
		this.tabletMapper = tabletMapper;
		this.firebasePushSender = firebasePushSender;
		this.taskExecutor = taskExecutor;
	}

	@Override
	@Transactional
	public TabletPushDeviceResponse registerDevice(String deviceId, TabletPushDeviceRequest request) {
		String normalizedDeviceId = normalizeDeviceId(deviceId);
		if (request == null) throw new IllegalArgumentException("기기 등록 정보가 없습니다.");
		if (request.getDeviceId() != null && !normalizedDeviceId.equals(request.getDeviceId().trim())) {
			throw new IllegalArgumentException("기기 식별자가 일치하지 않습니다.");
		}

		if (!request.isActive()) {
			tabletMapper.deactivatePushDevice(normalizedDeviceId);
			tabletMapper.deletePushDeviceStudents(normalizedDeviceId);
			return response(normalizedDeviceId);
		}

		String token = normalizeText(request.getFcmToken());
		String role = normalizeText(request.getRole()).toUpperCase(Locale.ROOT);
		Integer rsvtSn = request.getRsvtSn();
		if (token.isEmpty() || token.length() > 2048) throw new IllegalArgumentException("FCM 토큰이 올바르지 않습니다.");
		if (!"TEACHER".equals(role) && !"STUDENT".equals(role)) throw new IllegalArgumentException("사용자 모드가 올바르지 않습니다.");
		if (rsvtSn == null || rsvtSn <= 0 || tabletMapper.countReservation(rsvtSn) == 0) {
			throw new IllegalArgumentException("예약 정보가 올바르지 않습니다.");
		}

		List<Integer> studentSns = normalizeStudentSns(request.getStudentSns());
		if ("STUDENT".equals(role)) {
			if (studentSns.isEmpty()) throw new IllegalArgumentException("학생 선택 정보가 없습니다.");
			Set<Integer> reservationStudentSns = new LinkedHashSet<>(
				tabletMapper.selectStudents(rsvtSn).stream().map(TabletStudentVO::getStdntSn).toList());
			if (!reservationStudentSns.containsAll(studentSns)) {
				throw new IllegalArgumentException("예약에 포함되지 않은 학생이 선택되었습니다.");
			}
		} else {
			studentSns = List.of();
		}

		tabletMapper.deactivatePushDevicesByToken(normalizedDeviceId, token);
		tabletMapper.upsertPushDevice(TabletPushDeviceVO.builder()
			.deviceId(normalizedDeviceId)
			.fcmToken(token)
			.roleCd(role)
			.rsvtSn(rsvtSn)
			.activeYn("Y")
			.clientUpdatedAt(toLocalDateTime(request.getClientUpdatedAtEpochMs()))
			.build());
		tabletMapper.deletePushDeviceStudents(normalizedDeviceId);
		if (!studentSns.isEmpty()) tabletMapper.insertPushDeviceStudents(normalizedDeviceId, rsvtSn, studentSns);
		return response(normalizedDeviceId);
	}

	@Override
	public void sendTeacherCallAfterCommit(TabletTeacherCallVO teacherCall) {
		if (teacherCall == null || teacherCall.getRsvtSn() == null) return;
		runAfterCommit(() -> {
			List<String> tokens = tabletMapper.selectTeacherPushTokens(teacherCall.getRsvtSn());
			String place = normalizeText(teacherCall.getPlaceNm());
			String team = normalizeText(teacherCall.getTeamNm());
			String subject = team.isEmpty() ? "학생" : team;
			String body = subject + (place.isEmpty() ? "이 선생님을 호출했습니다." : "이 " + place + "에서 선생님을 호출했습니다.");
			firebasePushSender.send(tokens, "TEACHER_CALL", teacherCall.getRsvtSn(), teacherCall.getCallSn(),
				"선생님 호출", body, "/teacher/call_history");
		});
	}

	@Override
	public void sendTeacherMessageAfterCommit(TabletTeacherMessageVO teacherMessage, List<Integer> studentSns) {
		if (teacherMessage == null || teacherMessage.getRsvtSn() == null || studentSns == null || studentSns.isEmpty()) return;
		List<Integer> targets = List.copyOf(studentSns);
		runAfterCommit(() -> {
			List<String> tokens = tabletMapper.selectStudentPushTokens(teacherMessage.getRsvtSn(), targets);
			firebasePushSender.send(tokens, "TEACHER_MESSAGE", teacherMessage.getRsvtSn(), teacherMessage.getMsgSn(),
				"선생님 메시지", normalizeText(teacherMessage.getMessageCn()), "");
		});
	}

	private void runAfterCommit(Runnable task) {
		Runnable asyncTask = () -> taskExecutor.execute(task);
		if (TransactionSynchronizationManager.isActualTransactionActive()) {
			TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
				@Override
				public void afterCommit() {
					asyncTask.run();
				}
			});
		} else {
			asyncTask.run();
		}
	}

	private TabletPushDeviceResponse response(String deviceId) {
		return TabletPushDeviceResponse.builder()
			.success(true)
			.deviceId(deviceId)
			.serverUpdatedAt(ZonedDateTime.now(SERVICE_ZONE).format(DateTimeFormatter.ISO_OFFSET_DATE_TIME))
			.build();
	}

	private String normalizeDeviceId(String value) {
		String normalized = normalizeText(value);
		try {
			UUID.fromString(normalized);
		} catch (IllegalArgumentException e) {
			throw new IllegalArgumentException("기기 식별자가 올바르지 않습니다.");
		}
		return normalized;
	}

	private List<Integer> normalizeStudentSns(List<Integer> values) {
		if (values == null) return List.of();
		return values.stream().filter(value -> value != null && value > 0).distinct().toList();
	}

	private LocalDateTime toLocalDateTime(Long epochMs) {
		if (epochMs == null || epochMs <= 0) return LocalDateTime.now(SERVICE_ZONE);
		try {
			return LocalDateTime.ofInstant(Instant.ofEpochMilli(epochMs), SERVICE_ZONE);
		} catch (Exception ignored) {
			return LocalDateTime.now(SERVICE_ZONE);
		}
	}

	private String normalizeText(String value) {
		return value == null ? "" : value.trim();
	}
}
