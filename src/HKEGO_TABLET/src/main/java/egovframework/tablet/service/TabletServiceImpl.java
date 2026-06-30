package egovframework.tablet.service;

import egovframework.tablet.service.mapper.TabletMapper;
import egovframework.tablet.service.vo.TabletAdminVO;
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
import java.util.List;

@Service
public class TabletServiceImpl implements TabletService {
	private final TabletMapper tabletMapper;
	private final PasswordEncoder passwordEncoder;

	public TabletServiceImpl(TabletMapper tabletMapper, PasswordEncoder passwordEncoder) {
		this.tabletMapper = tabletMapper;
		this.passwordEncoder = passwordEncoder;
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
		return TabletSessionResponse.builder()
			.rsvtYmd(targetDate)
			.reservation(reservation)
			.students(students)
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
		tabletMapper.markAttendance(rsvtSn, studentSns);
	}

	private String normalizeDate(String value) {
		if (value == null || value.trim().isEmpty()) {
			return LocalDate.now().toString();
		}
		return value.trim();
	}
}
