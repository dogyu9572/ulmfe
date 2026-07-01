package egovframework.tablet.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import egovframework.tablet.service.mapper.TabletMapper;
import egovframework.tablet.service.vo.TabletAdminVO;
import egovframework.tablet.service.vo.TabletContentQuestionVO;
import egovframework.tablet.service.vo.TabletContentVO;
import egovframework.tablet.service.vo.TabletLoginRequest;
import egovframework.tablet.service.vo.TabletLoginResponse;
import egovframework.tablet.service.vo.TabletReservationVO;
import egovframework.tablet.service.vo.TabletSessionResponse;
import egovframework.tablet.service.vo.TabletStudentVO;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class TabletServiceImpl implements TabletService {
	private final TabletMapper tabletMapper;
	private final PasswordEncoder passwordEncoder;
	private final ObjectMapper objectMapper;

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
		TabletReservationVO reservation = tabletMapper.findReservationByDate(targetDate);
		List<TabletStudentVO> students = reservation == null ? List.of() : tabletMapper.selectStudents(reservation.getRsvtSn());
		List<TabletContentVO> contents = reservation == null ? List.of() : selectProgramContents(reservation.getStepJson());
		return TabletSessionResponse.builder()
			.rsvtYmd(targetDate)
			.reservation(reservation)
			.students(students)
			.contents(contents)
			.build();
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

	private String normalizeDate(String value) {
		if (value == null || value.trim().isEmpty()) {
			return LocalDate.now().toString();
		}
		return value.trim();
	}

	private List<TabletContentVO> selectProgramContents(String stepJson) {
		ContentRefs refs = extractContentRefs(stepJson);
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

	private record ContentRefs(List<Integer> contentIds, List<String> contentNames) {
	}
}
