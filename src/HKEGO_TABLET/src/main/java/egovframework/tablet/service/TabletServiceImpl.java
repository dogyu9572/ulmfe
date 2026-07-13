package egovframework.tablet.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import egovframework.tablet.service.mapper.TabletMapper;
import egovframework.tablet.service.vo.TabletAdminVO;
import egovframework.tablet.service.vo.TabletContentQuestionVO;
import egovframework.tablet.service.vo.TabletContentVO;
import egovframework.tablet.service.vo.TabletLearningResourceVO;
import egovframework.tablet.service.vo.TabletLoginRequest;
import egovframework.tablet.service.vo.TabletLoginResponse;
import egovframework.tablet.service.vo.TabletMakerAnswerRequest;
import egovframework.tablet.service.vo.TabletMissionFinalSubmitRequest;
import egovframework.tablet.service.vo.TabletMissionAnswerVO;
import egovframework.tablet.service.vo.TabletMissionSubmitRequest;
import egovframework.tablet.service.vo.TabletQuestionnaireAnswerVO;
import egovframework.tablet.service.vo.TabletQuestionnaireQuestionVO;
import egovframework.tablet.service.vo.TabletReservationVO;
import egovframework.tablet.service.vo.TabletSessionResponse;
import egovframework.tablet.service.vo.TabletStudentVO;
import egovframework.tablet.service.vo.TabletTeacherCallRequest;
import egovframework.tablet.service.vo.TabletTeacherCallVO;
import egovframework.tablet.service.vo.TabletTeacherMessageRequest;
import egovframework.tablet.service.vo.TabletTeacherMessageVO;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TabletServiceImpl implements TabletService {
	private static final ZoneId SERVICE_ZONE = ZoneId.of("Asia/Seoul");
	private static final DateTimeFormatter HOUR_MINUTE_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");
	private final TabletMapper tabletMapper;
	private final PasswordEncoder passwordEncoder;
	private final ObjectMapper objectMapper;
	@Value("${file.upload.path}")
	private String uploadPath;

	public TabletServiceImpl(TabletMapper tabletMapper, PasswordEncoder passwordEncoder, ObjectMapper objectMapper) {
		this.tabletMapper = tabletMapper;
		this.passwordEncoder = passwordEncoder;
		this.objectMapper = objectMapper;
	}

	@Override
	@Transactional
	public TabletLoginResponse login(TabletLoginRequest request, HttpServletRequest httpRequest) {
		String userId = request.getUserId() == null ? "" : request.getUserId().trim();
		String password = request.getPassword() == null ? "" : request.getPassword();
		TabletAdminVO admin = tabletMapper.findAdminById(userId);

		if (admin == null || admin.getEnpswd() == null || !passwordEncoder.matches(password, admin.getEnpswd())) {
			throw new IllegalArgumentException("아이디 또는 비밀번호가 올바르지 않습니다.");
		}
		if (admin.getAcntSttsCd() != null && !"ACTIVE".equalsIgnoreCase(admin.getAcntSttsCd())) {
			throw new IllegalArgumentException("비활성 관리자 계정입니다.");
		}

		UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
			admin.getId(),
			null,
			List.of(new SimpleGrantedAuthority("TABLET")));
		SecurityContextHolder.getContext().setAuthentication(authentication);

		HttpSession session = httpRequest.getSession(true);
		httpRequest.changeSessionId();
		session.setAttribute("tabletAdminId", admin.getId());
		session.setAttribute("tabletAdminName", admin.getUserNm());
		session.setAttribute("tabletAdminRole", admin.getAuthrtCd());
		tabletMapper.updateAdminLastLogin(admin.getId());

		return TabletLoginResponse.builder()
			.valid(true)
			.adminId(admin.getId())
			.adminName(admin.getUserNm())
			.adminRole(admin.getAuthrtCd())
			.build();
	}

	@Override
	public TabletLoginResponse getLoginSession(HttpSession session) {
		if (session == null || session.getAttribute("tabletAdminId") == null) {
			return TabletLoginResponse.builder().valid(false).adminId("").adminName("").adminRole("").build();
		}
		return TabletLoginResponse.builder()
			.valid(true)
			.adminId((String) session.getAttribute("tabletAdminId"))
			.adminName((String) session.getAttribute("tabletAdminName"))
			.adminRole((String) session.getAttribute("tabletAdminRole"))
			.build();
	}

	@Override
	public TabletSessionResponse getTodaySession(String rsvtYmd) {
		String targetDate = normalizeDate(rsvtYmd);
		String currentHm = LocalTime.now(SERVICE_ZONE).format(HOUR_MINUTE_FORMATTER);
		TabletReservationVO reservation = tabletMapper.findReservationByDate(targetDate, currentHm);
		List<TabletStudentVO> students = reservation == null ? List.of() : tabletMapper.selectStudents(reservation.getRsvtSn());
		List<TabletContentVO> contents = reservation == null ? List.of() : selectProgramContents(reservation.getStepJson());
		List<TabletQuestionnaireQuestionVO> evaluationQuestions = reservation == null ? List.of() : selectQuestionnaireQuestions(reservation.getEvalJson(), "studentEvaluationSn", "studentEvaluation", "EVAL");
		List<TabletQuestionnaireQuestionVO> surveyQuestions = reservation == null ? List.of() : selectQuestionnaireQuestions(reservation.getEvalJson(), "surveySn", "survey", "SURVEY");
		return TabletSessionResponse.builder()
			.rsvtYmd(targetDate)
			.reservation(reservation)
			.students(students)
			.contents(contents)
			.progressLogs(reservation == null ? List.of() : tabletMapper.selectProgressLogs(reservation.getRsvtSn()))
			.savedAnswers(reservation == null ? List.of() : tabletMapper.selectSavedAnswers(reservation.getRsvtSn()))
			.evaluationQuestions(evaluationQuestions)
			.surveyQuestions(surveyQuestions)
			.build();
	}

	@Override
	public List<TabletLearningResourceVO> getLearningResources(String prgrmTypeCd, Integer prgrmSn) {
		String normalizedType = normalizeText(prgrmTypeCd);
		if (isBlank(normalizedType) || prgrmSn == null || prgrmSn <= 0) {
			return List.of();
		}
		return tabletMapper.selectLearningResources(normalizedType, prgrmSn);
	}

	@Override
	public List<TabletTeacherCallVO> getTeacherCalls(Integer rsvtSn) {
		if (rsvtSn == null || rsvtSn <= 0) {
			return List.of();
		}
		return tabletMapper.selectTeacherCalls(rsvtSn);
	}

	@Override
	public List<TabletTeacherMessageVO> getTeacherMessages(Integer rsvtSn) {
		if (rsvtSn == null || rsvtSn <= 0) return List.of();
		return tabletMapper.selectTeacherMessages(rsvtSn);
	}

	@Override
	public List<TabletTeacherMessageVO> getUnreadTeacherMessages(Integer rsvtSn, List<Integer> studentSns) {
		if (rsvtSn == null || rsvtSn <= 0 || studentSns == null || studentSns.isEmpty()) return List.of();
		List<Integer> normalizedStudentSns = studentSns.stream()
			.filter(studentSn -> studentSn != null && studentSn > 0)
			.distinct()
			.toList();
		if (normalizedStudentSns.isEmpty()) return List.of();
		return tabletMapper.selectUnreadTeacherMessages(rsvtSn, normalizedStudentSns);
	}

	@Override
	@Transactional
	public void markAttendance(Integer rsvtSn, List<Integer> studentSns) {
		if (rsvtSn == null || rsvtSn <= 0) {
			throw new IllegalArgumentException("예약 정보가 올바르지 않습니다.");
		}
		if (studentSns == null || studentSns.isEmpty()) {
			throw new IllegalArgumentException("출석 처리할 학생을 선택하세요.");
		}
		tabletMapper.syncAttendance(rsvtSn, studentSns);
	}

	@Override
	@Transactional
	public void submitMission(Integer rsvtSn, TabletMissionSubmitRequest request) {
		submitMissionInternal(rsvtSn, request, Map.of());
	}

	@Override
	@Transactional
	public void submitMissionFiles(Integer rsvtSn, TabletMissionSubmitRequest request, Map<String, MultipartFile> filesByFieldName) {
		submitMissionInternal(rsvtSn, request, filesByFieldName == null ? Map.of() : filesByFieldName);
	}

	private void submitMissionInternal(Integer rsvtSn, TabletMissionSubmitRequest request, Map<String, MultipartFile> filesByFieldName) {
		if (rsvtSn == null || rsvtSn <= 0) {
			throw new IllegalArgumentException("예약 정보가 올바르지 않습니다.");
		}
		if (request == null || request.getStudentSns() == null || request.getStudentSns().isEmpty()) {
			throw new IllegalArgumentException("미션을 저장할 학생 정보가 없습니다.");
		}
		Integer routeIndex = request.getRouteIndex();
		if (routeIndex == null || routeIndex < 0) {
			throw new IllegalArgumentException("미션 단계 정보가 올바르지 않습니다.");
		}
		String stepCd = normalizeText(request.getStepCd());
		if (isBlank(stepCd)) {
			stepCd = missionStepCode(routeIndex);
		}
		String activityName = normalizeText(request.getRouteName());
		int totalRouteCount = Math.max(request.getTotalRouteCount() == null ? 0 : request.getTotalRouteCount(), routeIndex + 1);
		int progressRate = totalRouteCount <= 0 ? 0 : Math.min(100, Math.round(((routeIndex + 1) * 100f) / totalRouteCount));
		String learningStatus = progressRate >= 100 ? "DONE" : "ING";
		List<TabletMissionAnswerVO> answers = request.getAnswers() == null ? List.of() : request.getAnswers();
		List<TabletContentVO> requiredContents = selectMissionRouteContents(rsvtSn, routeIndex, activityName);
		validateMissionAnswers(requiredContents, answers, filesByFieldName);

		for (Integer studentSn : request.getStudentSns()) {
			if (studentSn == null || studentSn <= 0) continue;
			tabletMapper.deleteMissionAnswers(rsvtSn, studentSn, stepCd);
			for (TabletMissionAnswerVO answer : answers) {
				if (answer == null || (isBlank(answer.getAnsCn()) && (answer.getFiles() == null || answer.getFiles().isEmpty()))) continue;
				answer.setAnsCn(buildWorksheetAnswerValue(answer, filesByFieldName));
				tabletMapper.insertMissionAnswer(rsvtSn, studentSn, stepCd, answer);
			}
			if (tabletMapper.updateProgressLogDone(rsvtSn, studentSn, stepCd, activityName) == 0) {
				tabletMapper.insertProgressLogDone(rsvtSn, studentSn, stepCd, activityName);
			}
			tabletMapper.updateStudentProgress(rsvtSn, studentSn, progressRate, learningStatus);
		}
	}

	@Override
	@Transactional
	public void submitMaker(Integer rsvtSn, List<TabletMakerAnswerRequest> answers, Map<Integer, MultipartFile> filesByStudentSn) {
		if (rsvtSn == null || rsvtSn <= 0) {
			throw new IllegalArgumentException("예약 정보가 올바르지 않습니다.");
		}
		if (answers == null || answers.isEmpty()) {
			throw new IllegalArgumentException("저장할 학생 활동지가 없습니다.");
		}
		Map<Integer, TabletMakerAnswerRequest> answerMap = new HashMap<>();
		for (TabletMakerAnswerRequest answer : answers) {
			if (answer == null || answer.getStudentSn() == null || answer.getStudentSn() <= 0) continue;
			answerMap.put(answer.getStudentSn(), answer);
		}
		if (answerMap.isEmpty()) {
			throw new IllegalArgumentException("저장할 학생 정보가 없습니다.");
		}

		for (Map.Entry<Integer, TabletMakerAnswerRequest> entry : answerMap.entrySet()) {
			Integer studentSn = entry.getKey();
			TabletMakerAnswerRequest makerAnswer = entry.getValue();
			MultipartFile file = filesByStudentSn == null ? null : filesByStudentSn.get(studentSn);
			String description = normalizeText(makerAnswer.getDescription());

			tabletMapper.deleteMissionAnswers(rsvtSn, studentSn, "STEP3");
			if (!isBlank(description) || (file != null && !file.isEmpty())) {
				TabletMissionAnswerVO answer = new TabletMissionAnswerVO();
				answer.setCntnSn(0);
				answer.setQstnSn(0);
				answer.setQstnCn("내가 만든 울산을 알리는 나만의 연필꽂이는?");
				answer.setCardClsfCd("MEDIA");
				answer.setAnsCn(buildMakerAnswerJson(description, file));
				tabletMapper.insertMissionAnswer(rsvtSn, studentSn, "STEP3", answer);
			}
			if (tabletMapper.updateProgressLogDone(rsvtSn, studentSn, "STEP3", "사건해결") == 0) {
				tabletMapper.insertProgressLogDone(rsvtSn, studentSn, "STEP3", "사건해결");
			}
		}
	}

	@Override
	@Transactional
	public void submitMissionFinal(Integer rsvtSn, TabletMissionFinalSubmitRequest request) {
		if (rsvtSn == null || rsvtSn <= 0) {
			throw new IllegalArgumentException("예약 정보가 올바르지 않습니다.");
		}
		if (request == null || request.getStudentSns() == null || request.getStudentSns().isEmpty()) {
			throw new IllegalArgumentException("최종 미션을 저장할 학생 정보가 없습니다.");
		}
		String heroName = normalizeText(request.getHeroName());
		boolean updateHero = Boolean.TRUE.equals(request.getUpdateHero());
		boolean updateEvaluation = Boolean.TRUE.equals(request.getUpdateEvaluation()) || Boolean.TRUE.equals(request.getComplete());
		boolean updateSurvey = Boolean.TRUE.equals(request.getUpdateSurvey()) || Boolean.TRUE.equals(request.getComplete());
		boolean complete = Boolean.TRUE.equals(request.getComplete());

		if (updateHero && isBlank(heroName)) {
			throw new IllegalArgumentException("SDGs 히어로즈 이름을 입력해주세요.");
		}

		TabletQuestionnaireAnswerVO heroAnswer = new TabletQuestionnaireAnswerVO();
		heroAnswer.setQstnCn("SDGs 히어로즈 이름");
		heroAnswer.setAnsCn(heroName);

		for (Integer studentSn : request.getStudentSns()) {
			if (studentSn == null || studentSn <= 0) continue;
			if (updateHero) saveTypedAnswers(rsvtSn, studentSn, "HERO", "STEP4", List.of(heroAnswer));
			if (updateEvaluation) saveTypedAnswers(rsvtSn, studentSn, "EVALUATION", "STEP4", request.getEvaluationAnswers());
			if (updateSurvey) saveTypedAnswers(rsvtSn, studentSn, "SURVEY", "STEP4", request.getSurveyAnswers());
			if (complete) {
				if (tabletMapper.updateProgressLogDone(rsvtSn, studentSn, "STEP4", "실천력 부여") == 0) {
					tabletMapper.insertProgressLogDone(rsvtSn, studentSn, "STEP4", "실천력 부여");
				}
				tabletMapper.updateStudentProgress(rsvtSn, studentSn, 100, "DONE");
			}
		}
	}

	@Override
	@Transactional
	public void createTeacherCall(Integer rsvtSn, TabletTeacherCallRequest request) {
		if (rsvtSn == null || rsvtSn <= 0) {
			throw new IllegalArgumentException("예약 정보가 올바르지 않습니다.");
		}
		if (request == null || request.getStudentSns() == null || request.getStudentSns().isEmpty()) {
			throw new IllegalArgumentException("호출할 학생 정보가 없습니다.");
		}

		Set<Integer> selectedStudentIds = request.getStudentSns().stream()
			.filter(studentSn -> studentSn != null && studentSn > 0)
			.collect(Collectors.toCollection(LinkedHashSet::new));
		if (selectedStudentIds.isEmpty()) {
			throw new IllegalArgumentException("호출할 학생 정보가 없습니다.");
		}

		List<TabletStudentVO> selectedStudents = tabletMapper.selectStudents(rsvtSn).stream()
			.filter(student -> selectedStudentIds.contains(student.getStdntSn()))
			.toList();
		if (selectedStudents.isEmpty()) {
			throw new IllegalArgumentException("예약에 포함된 학생 정보가 없습니다.");
		}

		TabletTeacherCallVO teacherCall = new TabletTeacherCallVO();
		teacherCall.setRsvtSn(rsvtSn);
		teacherCall.setTeamNm(joinUnique(selectedStudents.stream().map(TabletStudentVO::getTeamNm).toList()));
		teacherCall.setStudentNames(displayStudentNames(selectedStudents));
		teacherCall.setStudentCount(selectedStudents.size());
		teacherCall.setPlaceNm(normalizeText(request.getPlaceNm()));
		teacherCall.setCallCn("선생님을 호출했어요.");
		tabletMapper.insertTeacherCall(teacherCall);
	}

	@Override
	@Transactional
	public void markTeacherCallRead(Long callSn) {
		if (callSn == null || callSn <= 0) {
			throw new IllegalArgumentException("호출 내역 정보가 올바르지 않습니다.");
		}
		tabletMapper.updateTeacherCallRead(callSn);
	}

	@Override
	@Transactional
	public void markAllTeacherCallsRead(Integer rsvtSn) {
		if (rsvtSn == null || rsvtSn <= 0) {
			throw new IllegalArgumentException("예약 정보가 올바르지 않습니다.");
		}
		tabletMapper.updateAllTeacherCallsRead(rsvtSn);
	}

	@Override
	@Transactional
	public void createTeacherMessage(Integer rsvtSn, TabletTeacherMessageRequest request) {
		if (rsvtSn == null || rsvtSn <= 0) {
			throw new IllegalArgumentException("예약 정보가 올바르지 않습니다.");
		}
		String messageCn = request == null ? "" : normalizeText(request.getMessageCn());
		if (isBlank(messageCn)) {
			throw new IllegalArgumentException("메시지를 입력해주세요.");
		}
		if (messageCn.length() > 1000) {
			throw new IllegalArgumentException("메시지는 1,000자 이내로 입력해주세요.");
		}
		if (request.getStudentSns() == null || request.getStudentSns().isEmpty()) {
			throw new IllegalArgumentException("메시지를 받을 학생을 선택해주세요.");
		}
		Set<Integer> requestedStudentIds = request.getStudentSns().stream()
			.filter(studentSn -> studentSn != null && studentSn > 0)
			.collect(Collectors.toCollection(LinkedHashSet::new));
		if (requestedStudentIds.isEmpty()) {
			throw new IllegalArgumentException("메시지를 받을 학생을 선택해주세요.");
		}

		List<TabletStudentVO> reservationStudents = tabletMapper.selectStudents(rsvtSn);
		List<TabletStudentVO> selectedStudents = reservationStudents.stream()
			.filter(student -> requestedStudentIds.contains(student.getStdntSn()))
			.toList();
		if (selectedStudents.size() != requestedStudentIds.size()) {
			throw new IllegalArgumentException("예약에 포함되지 않은 학생이 선택되었습니다.");
		}

		TabletTeacherMessageVO teacherMessage = new TabletTeacherMessageVO();
		teacherMessage.setRsvtSn(rsvtSn);
		teacherMessage.setTargetNm(selectedStudents.size() == reservationStudents.size()
			? "전체(" + selectedStudents.size() + "명)"
			: messageTargetName(selectedStudents));
		teacherMessage.setStudentCount(selectedStudents.size());
		teacherMessage.setMessageCn(messageCn);
		tabletMapper.insertTeacherMessage(teacherMessage);
		tabletMapper.insertTeacherMessageRecipients(
			teacherMessage.getMsgSn(),
			rsvtSn,
			selectedStudents.stream().map(TabletStudentVO::getStdntSn).toList());
	}

	@Override
	@Transactional
	public void markTeacherMessageRead(Long msgSn, List<Integer> studentSns) {
		if (msgSn == null || msgSn <= 0) {
			throw new IllegalArgumentException("메시지 정보가 올바르지 않습니다.");
		}
		if (studentSns == null || studentSns.isEmpty()) {
			throw new IllegalArgumentException("학생 선택 정보가 없습니다.");
		}
		List<Integer> normalizedStudentSns = studentSns.stream()
			.filter(studentSn -> studentSn != null && studentSn > 0)
			.distinct()
			.toList();
		if (normalizedStudentSns.isEmpty()) {
			throw new IllegalArgumentException("학생 선택 정보가 없습니다.");
		}
		tabletMapper.updateTeacherMessageRead(msgSn, normalizedStudentSns);
	}

	private String missionStepCode(int routeIndex) {
		return "MISSION" + String.format("%02d", routeIndex + 1);
	}

	private String normalizeText(String value) {
		return value == null ? "" : value.trim();
	}

	private String joinUnique(List<String> values) {
		return values.stream()
			.map(this::normalizeText)
			.filter(value -> !value.isEmpty())
			.collect(Collectors.toCollection(LinkedHashSet::new))
			.stream()
			.collect(Collectors.joining(", "));
	}

	private String displayStudentNames(List<TabletStudentVO> students) {
		if (students == null || students.isEmpty()) return "";
		String firstName = normalizeText(students.get(0).getStdntNm());
		if (students.size() == 1) return firstName;
		return firstName + " 외 " + (students.size() - 1) + "명";
	}

	private String messageTargetName(List<TabletStudentVO> students) {
		String teamNames = joinUnique(students.stream().map(TabletStudentVO::getTeamNm).toList());
		return isBlank(teamNames) ? displayStudentNames(students) : teamNames + "(" + students.size() + "명)";
	}

	private boolean isBlank(String value) {
		return value == null || value.trim().isEmpty();
	}

	private void saveTypedAnswers(Integer rsvtSn, Integer studentSn, String ansTypeCd, String stepCd, List<TabletQuestionnaireAnswerVO> answers) {
		tabletMapper.deleteTypedAnswers(rsvtSn, studentSn, ansTypeCd);
		if (answers == null) return;
		for (TabletQuestionnaireAnswerVO answer : answers) {
			if (answer == null || isBlank(answer.getAnsCn())) continue;
			tabletMapper.insertTypedAnswer(rsvtSn, studentSn, ansTypeCd, stepCd, answer);
		}
	}

	private String normalizeDate(String value) {
		if (value == null || value.trim().isEmpty()) {
			return LocalDate.now(SERVICE_ZONE).toString();
		}
		return value.trim();
	}

	private List<TabletQuestionnaireQuestionVO> selectQuestionnaireQuestions(String evalJson, String snKey, String nameKey, String qstnrTypeCd) {
		Integer qstnrSn = questionnaireSn(evalJson, snKey);
		if (qstnrSn != null && qstnrSn > 0) {
			return tabletMapper.selectQuestionnaireQuestions(qstnrSn, qstnrTypeCd);
		}
		String qstnrNm = questionnaireText(evalJson, nameKey);
		if (isBlank(qstnrNm)) return List.of();
		return tabletMapper.selectQuestionnaireQuestionsByName(qstnrNm, qstnrTypeCd);
	}

	private Integer questionnaireSn(String evalJson, String key) {
		if (isBlank(evalJson)) return null;
		try {
			JsonNode node = objectMapper.readTree(evalJson);
			JsonNode value = node.get(key);
			if (value == null || value.isNull()) return null;
			if (value.isInt() || value.isLong()) return value.asInt();
			String text = value.asText("").trim();
			if (text.isEmpty()) return null;
			return Integer.parseInt(text);
		} catch (Exception e) {
			return null;
		}
	}

	private String questionnaireText(String evalJson, String key) {
		if (isBlank(evalJson)) return "";
		try {
			JsonNode node = objectMapper.readTree(evalJson);
			JsonNode value = node.get(key);
			if (value == null || value.isNull()) return "";
			return value.asText("").trim();
		} catch (Exception e) {
			return "";
		}
	}

	private List<TabletContentVO> selectProgramContents(String stepJson) {
		ContentRefs refs = extractContentRefs(stepJson);
		return selectContents(refs);
	}

	private List<TabletContentVO> selectMissionRouteContents(Integer rsvtSn, int routeIndex, String routeName) {
		String stepJson = tabletMapper.selectReservationStepJson(rsvtSn);
		if (isBlank(stepJson)) {
			throw new IllegalArgumentException("예약에 연결된 미션 프로그램 정보가 없습니다.");
		}
		try {
			JsonNode steps = objectMapper.readTree(stepJson);
			if (!steps.isArray()) throw new IllegalArgumentException("미션 프로그램 단계 정보가 올바르지 않습니다.");
			for (JsonNode step : steps) {
				if (!"STEP3".equals(step.path("step").asText(""))) continue;
				JsonNode quests = step.path("quests");
				if (!quests.isArray()) {
					throw new IllegalArgumentException("미션 단계에 연결된 콘텐츠가 없습니다.");
				}
				JsonNode selectedQuest = null;
				if (!isBlank(routeName)) {
					for (JsonNode quest : quests) {
						if (routeName.equals(normalizeText(quest.path("name").asText("")))) {
							selectedQuest = quest;
							break;
						}
					}
				}
				if (selectedQuest == null && routeIndex < quests.size()) selectedQuest = quests.get(routeIndex);
				if (selectedQuest == null) throw new IllegalArgumentException("미션 단계에 연결된 콘텐츠가 없습니다.");
				Set<Integer> contentIds = new LinkedHashSet<>();
				Set<String> contentNames = new LinkedHashSet<>();
				collectContentRefs(selectedQuest.path("contents"), contentIds, contentNames);
				return selectContents(new ContentRefs(new ArrayList<>(contentIds), new ArrayList<>(contentNames)));
			}
		} catch (IllegalArgumentException e) {
			throw e;
		} catch (Exception e) {
			throw new IllegalArgumentException("미션 프로그램 단계 정보를 확인하지 못했습니다.");
		}
		throw new IllegalArgumentException("미션 수행 단계 정보가 없습니다.");
	}

	private List<TabletContentVO> selectContents(ContentRefs refs) {
		if (refs.contentIds().isEmpty() && refs.contentNames().isEmpty()) {
			return List.of();
		}

		List<TabletContentVO> contents = new ArrayList<>();
		if (!refs.contentIds().isEmpty()) {
			contents.addAll(tabletMapper.selectContentsByIds(refs.contentIds()));
		}
		if (!refs.contentNames().isEmpty()) {
			Set<Integer> existingIds = contents.stream()
				.map(TabletContentVO::getCntnSn)
				.filter(id -> id != null && id > 0)
				.collect(Collectors.toCollection(LinkedHashSet::new));
			tabletMapper.selectContentsByNames(refs.contentNames()).stream()
				.filter(content -> content.getCntnSn() == null || !existingIds.contains(content.getCntnSn()))
				.forEach(contents::add);
		}
		List<Integer> contentIds = contents.stream()
			.map(TabletContentVO::getCntnSn)
			.filter(id -> id != null && id > 0)
			.toList();
		if (contentIds.isEmpty()) {
			return contents;
		}

		Map<Integer, List<TabletContentQuestionVO>> questionsByContentId = tabletMapper.selectContentQuestions(contentIds).stream()
			.collect(Collectors.groupingBy(TabletContentQuestionVO::getCntnSn));
		contents.forEach(content -> content.setQuestions(questionsByContentId.getOrDefault(content.getCntnSn(), List.of())));
		return contents;
	}

	private void validateMissionAnswers(List<TabletContentVO> requiredContents, List<TabletMissionAnswerVO> answers,
		Map<String, MultipartFile> filesByFieldName) {
		if (requiredContents == null || requiredContents.isEmpty()) {
			throw new IllegalArgumentException("미션 단계에 연결된 콘텐츠가 없습니다.");
		}
		Set<String> submittedAnswerKeys = answers.stream()
			.filter(answer -> answer != null && hasMissionAnswerValue(answer, filesByFieldName))
			.map(answer -> answerKey(answer.getCntnSn(), answer.getQstnSn()))
			.collect(Collectors.toSet());
		List<String> missingQuestions = new ArrayList<>();
		for (TabletContentVO content : requiredContents) {
			List<TabletContentQuestionVO> questions = content.getQuestions();
			if (questions == null || questions.isEmpty()) {
				if (!submittedAnswerKeys.contains(answerKey(content.getCntnSn(), content.getCntnSn()))) {
					missingQuestions.add(content.getCntnTtl());
				}
				continue;
			}
			for (TabletContentQuestionVO question : questions) {
				if (!submittedAnswerKeys.contains(answerKey(content.getCntnSn(), question.getCntnQstnSn()))) {
					missingQuestions.add(question.getQstnNm());
				}
			}
		}
		if (!missingQuestions.isEmpty()) {
			throw new IllegalArgumentException("모든 문항에 답해야 미션을 완료할 수 있습니다. (미완료 " + missingQuestions.size() + "개)");
		}
	}

	private boolean hasMissionAnswerValue(TabletMissionAnswerVO answer, Map<String, MultipartFile> filesByFieldName) {
		if (!isBlank(answer.getAnsCn())) return true;
		if (answer.getFiles() == null || answer.getFiles().isEmpty()) return false;
		return answer.getFiles().stream().anyMatch(fileInfo -> {
			if (fileInfo == null || isBlank(fileInfo.getFieldName())) return false;
			MultipartFile file = filesByFieldName == null ? null : filesByFieldName.get(fileInfo.getFieldName());
			return file != null && !file.isEmpty();
		});
	}

	private String answerKey(Integer contentSn, Integer questionSn) {
		return (contentSn == null ? 0 : contentSn) + ":" + (questionSn == null ? 0 : questionSn);
	}

	private ContentRefs extractContentRefs(String stepJson) {
		if (stepJson == null || stepJson.trim().isEmpty()) {
			return new ContentRefs(List.of(), List.of());
		}
		Set<Integer> contentIds = new LinkedHashSet<>();
		Set<String> contentNames = new LinkedHashSet<>();
		try {
			collectContentRefs(objectMapper.readTree(stepJson), contentIds, contentNames);
		} catch (Exception ignored) {
			return new ContentRefs(List.of(), List.of());
		}
		return new ContentRefs(new ArrayList<>(contentIds), new ArrayList<>(contentNames));
	}

	private void collectContentRefs(JsonNode node, Set<Integer> contentIds, Set<String> contentNames) {
		if (node == null || node.isNull()) return;
		if (node.isObject()) {
			JsonNode cntnSn = node.get("cntnSn");
			if (cntnSn != null) {
				if (cntnSn.isInt() || cntnSn.isLong()) {
					contentIds.add(cntnSn.asInt());
				} else if (cntnSn.isTextual() && !cntnSn.asText().trim().isEmpty()) {
					try {
						contentIds.add(Integer.parseInt(cntnSn.asText().trim()));
					} catch (NumberFormatException ignored) {
						// 기존 저장 데이터는 식별자가 없을 수 있어 이름 매칭으로 보완합니다.
					}
				}
			}
			JsonNode contentName = node.get("contentName");
			if (contentName != null && contentName.isTextual() && !contentName.asText().trim().isEmpty()) {
				contentNames.add(contentName.asText().trim());
			}
			node.fields().forEachRemaining(entry -> collectContentRefs(entry.getValue(), contentIds, contentNames));
			return;
		}
		if (node.isArray()) {
			node.forEach(item -> collectContentRefs(item, contentIds, contentNames));
		}
	}

	private String buildWorksheetAnswerValue(TabletMissionAnswerVO answer, Map<String, MultipartFile> filesByFieldName) {
		if (answer.getFiles() == null || answer.getFiles().isEmpty()) {
			return answer.getAnsCn();
		}
		ObjectNode payload = objectMapper.createObjectNode();
		payload.put("type", "WORKSHEET_FILES");
		payload.put("answer", answer.getAnsCn() == null ? "" : answer.getAnsCn());
		var fileArray = payload.putArray("files");
		answer.getFiles().forEach(fileInfo -> {
			if (fileInfo == null || isBlank(fileInfo.getFieldName())) return;
			MultipartFile file = filesByFieldName == null ? null : filesByFieldName.get(fileInfo.getFieldName());
			if (file == null || file.isEmpty()) return;
			StoredMakerFile storedFile = storeMakerFile(file);
			ObjectNode fileNode = objectMapper.createObjectNode();
			fileNode.put("label", fileInfo.getLabel() == null ? "" : fileInfo.getLabel());
			fileNode.put("fileName", storedFile.originalFileName());
			fileNode.put("fileUrl", storedFile.fileUrl());
			fileArray.add(fileNode);
		});
		try {
			return objectMapper.writeValueAsString(payload);
		} catch (Exception e) {
			throw new IllegalArgumentException("활동지 저장값 생성 중 오류가 발생했습니다.");
		}
	}

	private String buildMakerAnswerJson(String description, MultipartFile file) {
		ObjectNode payload = objectMapper.createObjectNode();
		payload.put("type", "MAKER_PENCIL_HOLDER");
		payload.put("description", description == null ? "" : description);
		if (file != null && !file.isEmpty()) {
			StoredMakerFile storedFile = storeMakerFile(file);
			payload.put("fileName", storedFile.originalFileName());
			payload.put("fileUrl", storedFile.fileUrl());
		}
		try {
			return objectMapper.writeValueAsString(payload);
		} catch (Exception e) {
			throw new IllegalArgumentException("활동지 저장값 생성 중 오류가 발생했습니다.");
		}
	}

	private StoredMakerFile storeMakerFile(MultipartFile file) {
		String originalFileName = sanitizeFileName(file.getOriginalFilename());
		String extension = fileExtension(originalFileName);
		if (!isAllowedMakerFileExtension(extension)) {
			throw new IllegalArgumentException("연필꽂이 사진은 jpg, jpeg, png, gif, webp 파일만 첨부할 수 있습니다.");
		}
		String dateFolder = LocalDate.now(SERVICE_ZONE).format(DateTimeFormatter.BASIC_ISO_DATE);
		String storedFileName = UUID.randomUUID() + "." + extension;
		Path relativePath = Paths.get("tablet-results", dateFolder, storedFileName);
		Path basePath = Paths.get(uploadPath).toAbsolutePath().normalize();
		Path targetPath = basePath.resolve(relativePath).normalize();
		if (!targetPath.startsWith(basePath)) {
			throw new IllegalArgumentException("파일 저장 경로가 올바르지 않습니다.");
		}
		try {
			Files.createDirectories(targetPath.getParent());
			Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
		} catch (IOException e) {
			throw new IllegalArgumentException("파일 저장 중 오류가 발생했습니다.");
		}
		String fileUrl = "/uploads/" + relativePath.toString().replace("\\", "/");
		return new StoredMakerFile(originalFileName, fileUrl);
	}

	private String sanitizeFileName(String value) {
		String fileName = value == null ? "attachment" : value.trim();
		fileName = fileName.replace("\\", "/");
		int slashIndex = fileName.lastIndexOf('/');
		if (slashIndex >= 0) fileName = fileName.substring(slashIndex + 1);
		fileName = fileName.replaceAll("[\\r\\n\\t]", "_").trim();
		return fileName.isEmpty() ? "attachment" : fileName;
	}

	private String fileExtension(String fileName) {
		int dotIndex = fileName.lastIndexOf('.');
		if (dotIndex < 0 || dotIndex == fileName.length() - 1) return "";
		return fileName.substring(dotIndex + 1).toLowerCase();
	}

	private boolean isAllowedMakerFileExtension(String extension) {
		return Set.of("jpg", "jpeg", "png", "gif", "webp").contains(extension);
	}

	private record StoredMakerFile(String originalFileName, String fileUrl) {
	}

	private record ContentRefs(List<Integer> contentIds, List<String> contentNames) {
	}
}
