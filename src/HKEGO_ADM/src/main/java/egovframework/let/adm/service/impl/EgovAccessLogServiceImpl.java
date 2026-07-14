package egovframework.let.adm.service.impl;

import jakarta.annotation.Resource;
import egovframework.let.adm.service.vo.AdminAccessLogVO;
import egovframework.let.adm.service.vo.CodeDtVO;
import org.egovframe.rte.fdl.cmmn.EgovAbstractServiceImpl;

import egovframework.let.adm.service.EgovAccessLogService;

import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service("egovAccessLogService")
public class EgovAccessLogServiceImpl extends EgovAbstractServiceImpl implements EgovAccessLogService {
	@Resource(name = "adminAccessLogDAO")
	private AdminAccessLogDAO adminAccessLogDAO;
	@Resource(name = "codeDAO")
	private CodeDAO codeDAO;

	public Map<String, Object> getAccessLogs(
		String menu1Cd,
		String menu2Cd,
		String userNm,
		String startDate,
		String endDate,
		int page,
		int size
	) {
		int safePage = Math.max(page, 1);
		int safeSize = Math.min(Math.max(size, 1), 100);
		int offset = (safePage - 1) * safeSize;
		List<AdminAccessLogVO> filtered = getAccessLogExcelRows(menu1Cd, menu2Cd, userNm, startDate, endDate);
		int count = filtered.size();
		List<AdminAccessLogVO> list = offset >= count
			? List.of()
			: filtered.subList(offset, Math.min(offset + safeSize, count));
		Map<String, Object> result = new HashMap<>();
		result.put("list", list);
		result.put("count", count);
		result.put("page", safePage);
		result.put("size", safeSize);
		return result;
	}

	public List<AdminAccessLogVO> getAccessLogExcelRows(
		String menu1Cd,
		String menu2Cd,
		String userNm,
		String startDate,
		String endDate
	) {
		Map<String, String> topNames = new HashMap<>();
		for (CodeDtVO code : codeDAO.selectCodeDtList("COM001", "Y")) {
			topNames.put(code.getCdDtlId(), code.getCdDtlNm());
		}
		List<CodeDtVO> subMenus = codeDAO.selectCodeDtList("COM002", "Y");
		return adminAccessLogDAO.selectExcelList(userNm, startDate, endDate).stream()
			.peek(log -> enrichLog(log, topNames, subMenus))
			.filter(log -> isBlank(menu1Cd) || menu1Cd.equals(log.getMenu1Cd()))
			.filter(log -> isBlank(menu2Cd) || menu2Cd.equals(log.getMenu2Cd()))
			.toList();
	}

	private void enrichLog(AdminAccessLogVO log, Map<String, String> topNames, List<CodeDtVO> subMenus) {
		String accessType = value(log.getCntnTypeCd());
		String uri = value(log.getDmndUriAddr());
		String action = actionName(accessType, log.getDmndMthdCd(), uri);
		if (accessType.startsWith("LOGIN") || "LOGOUT".equals(accessType)) {
			log.setMenu1Cd("10");
			log.setMenu1Nm(topNames.getOrDefault("10", "시스템 관리"));
			log.setMenu2Cd("");
			log.setMenu2Nm("관리자 로그인");
		} else {
			String adminPath = resolveAdminPath(uri);
			CodeDtVO matched = subMenus.stream()
				.filter(menu -> pathOf(menu).equals(adminPath))
				.findFirst()
				.orElse(null);
			if (matched != null) {
				String topCode = matched.getCdDtlId().length() >= 2 ? matched.getCdDtlId().substring(0, 2) : "";
				log.setMenu1Cd(topCode);
				log.setMenu1Nm(topNames.getOrDefault(topCode, "-"));
				log.setMenu2Cd(matched.getCdDtlId());
				log.setMenu2Nm(matched.getCdDtlNm());
			} else {
				log.setMenu1Cd("");
				log.setMenu1Nm("-");
				log.setMenu2Cd("");
				log.setMenu2Nm("-");
			}
		}
		log.setActionNm(action);
		String menuName = "-".equals(log.getMenu2Nm()) ? "관리자 기능" : log.getMenu2Nm();
		String failure = log.getRspnsSttsCd() != null && log.getRspnsSttsCd() >= 400 && !action.endsWith("실패") ? " 실패" : "";
		log.setActionCn(menuName + " " + action + failure + (uri.isBlank() ? "" : " (" + uri + ")"));
	}

	private String pathOf(CodeDtVO code) {
		if (!isBlank(code.getCdDtlCn())) return code.getCdDtlCn().trim();
		if (!isBlank(code.getEtc2())) return code.getEtc2().trim();
		if (!isBlank(code.getEtc3())) return code.getEtc3().trim();
		return "";
	}

	private String actionName(String accessType, String method, String uri) {
		return switch (accessType) {
			case "LOGIN" -> "로그인";
			case "LOGOUT" -> "로그아웃";
			case "LOGIN_FAIL", "LOGIN_DENY" -> "로그인 실패";
			case "CREATE" -> "등록";
			case "UPDATE" -> "수정";
			case "DELETE" -> "삭제";
			case "DOWNLOAD" -> "다운로드";
			case "PRINT" -> "출력";
			default -> {
				String verb = value(method).toUpperCase();
				if ("DELETE".equals(verb)) yield "삭제";
				if ("PUT".equals(verb) || "PATCH".equals(verb)) yield "수정";
				if (uri.toLowerCase().contains("excel") || uri.toLowerCase().contains("download")) yield "다운로드";
				yield "조회";
			}
		};
	}

	private String resolveAdminPath(String uri) {
		if (uri.startsWith("/api/admin/bbs-post/")) {
			String id = uri.substring("/api/admin/bbs-post/".length()).split("/")[0];
			return "/admin/bbs-post/" + id;
		}
		if (uri.startsWith("/api/admin/education-programs/")) {
			String type = uri.substring("/api/admin/education-programs/".length()).split("/")[0];
			if ("EXPLORE".equalsIgnoreCase(type)) return "/admin/exploration-programs";
			if ("MISSION".equalsIgnoreCase(type)) return "/admin/mission-programs";
		}
		String[][] mappings = {
			{"/api/admin/admins", "/admin/admins"}, {"/api/admin/auth/groups", "/admin/admin-groups"},
			{"/api/admin/codes", "/admin/codes"}, {"/api/admin/homepage-menus", "/admin/menus"},
			{"/api/admin/bbs-master", "/admin/bbs-master"}, {"/api/admin/site-basic-setting", "/admin/basic-setting"},
			{"/api/admin/access-env", "/admin/access-env"}, {"/api/admin/history", "/admin/history"},
			{"/api/admin/org-chart", "/admin/org-chart"}, {"/api/admin/terms", "/admin/terms"},
			{"/api/admin/search-pages", "/admin/search-pages"}, {"/api/admin/banner", "/admin/banners"},
			{"/api/admin/popup", "/admin/popups"}, {"/api/admin/library-books", "/admin/library-books"},
			{"/api/admin/evaluation-forms", "/admin/evaluation-forms"}, {"/api/admin/survey-forms", "/admin/survey-forms"},
			{"/api/admin/education-contents", "/admin/education-contents"}, {"/api/admin/field-operation-status", "/admin/field-operation-status"},
			{"/api/admin/learning-calendar", "/admin/learning-calendar"}, {"/api/admin/learning-results", "/admin/learning-results"},
			{"/api/admin/learning-reservations", "/admin/learning-reservations"}, {"/api/admin/learning-support-materials", "/admin/learning-support-materials"},
			{"/api/admin/users", "/admin/users"},
			{"/api/admin/user-visitor-stats", "/admin/user-visitor-stats"}, {"/api/admin/user-access-log", "/admin/user-access-log"},
			{"/api/admin/notification-log", "/admin/notification-log"}, {"/api/admin/visitor-stats", "/admin/visitor-stats"},
			{"/api/admin/education-program-stats", "/admin/education-program-stats"}, {"/api/admin/material-download-stats", "/admin/material-download-stats"}
		};
		for (String[] mapping : mappings) if (uri.startsWith(mapping[0])) return mapping[1];
		return "";
	}

	private boolean isBlank(String value) {
		return value == null || value.isBlank();
	}

	private String value(String value) {
		return value == null ? "" : value;
	}
}
