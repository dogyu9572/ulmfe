// 메뉴 권한 판정 회귀 테스트 — 예약 전용 역할이 교육프로그램을 수정하지 못하는지 검증한다
package egovframework.com.security;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import egovframework.let.adm.service.EgovAdminRolePolicyService;
import egovframework.let.adm.service.EgovAuthGroupService;

class AdminMenuAuthorizationServiceTest {
	private static final String ROLE = "ROLE_TEST";
	private static final String PROGRAM_LIST_URI = "/api/admin/education-programs";
	private static final String PROGRAM_ITEM_URI = "/api/admin/education-programs/EXPLORE/1";

	private EgovAuthGroupService authGroupService;
	private AdminMenuAuthorizationService service;

	@BeforeEach
	void setUp() {
		EgovAdminRolePolicyService rolePolicyService = mock(EgovAdminRolePolicyService.class);
		when(rolePolicyService.isSuperRole(anyString())).thenReturn(false);
		authGroupService = mock(EgovAuthGroupService.class);
		service = new AdminMenuAuthorizationService(rolePolicyService, authGroupService);
	}

	private void givenMenus(String... menuPaths) {
		when(authGroupService.getAuthorizedMenuPaths(ROLE)).thenReturn(List.of(menuPaths));
	}

	@Test
	void 예약_전용_역할은_프로그램_목록을_조회할_수_있다() {
		givenMenus("/admin/learning-reservations");
		assertTrue(service.isAuthorized(ROLE, PROGRAM_LIST_URI, "GET"));
	}

	@Test
	void 예약_전용_역할은_프로그램을_등록_수정_삭제할_수_없다() {
		givenMenus("/admin/learning-reservations");
		assertFalse(service.isAuthorized(ROLE, PROGRAM_LIST_URI, "POST"));
		assertFalse(service.isAuthorized(ROLE, PROGRAM_ITEM_URI, "PUT"));
		assertFalse(service.isAuthorized(ROLE, PROGRAM_ITEM_URI, "DELETE"));
	}

	@Test
	void 프로그램_관리_역할은_수정과_삭제까지_할_수_있다() {
		givenMenus("/admin/exploration-programs");
		assertTrue(service.isAuthorized(ROLE, PROGRAM_ITEM_URI, "PUT"));
		assertTrue(service.isAuthorized(ROLE, PROGRAM_ITEM_URI, "DELETE"));
	}

	@Test
	void 메서드를_알_수_없으면_쓰기로_보고_막는다() {
		givenMenus("/admin/learning-reservations");
		assertFalse(service.isAuthorized(ROLE, PROGRAM_LIST_URI, null));
	}
}
