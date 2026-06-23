package egovframework.com.security;

import java.util.List;

import org.springframework.stereotype.Service;

import egovframework.let.adm.service.EgovAdminRolePolicyService;
import egovframework.let.adm.service.EgovAuthGroupService;

@Service
public class AdminMenuAuthorizationService {
	private final EgovAdminRolePolicyService adminRolePolicyService;
	private final EgovAuthGroupService authGroupService;

	public AdminMenuAuthorizationService(
		EgovAdminRolePolicyService adminRolePolicyService,
		EgovAuthGroupService authGroupService) {
		this.adminRolePolicyService = adminRolePolicyService;
		this.authGroupService = authGroupService;
	}

	public boolean isAuthorized(String adminRole, String requestUri) {
		if (adminRole == null || adminRole.isBlank()) {
			return false;
		}
		if (adminRolePolicyService.isSuperRole(adminRole)) {
			return true;
		}
		if (isSharedAuthenticatedApi(requestUri)) {
			return true;
		}
		List<String> allowedMenuPaths = authGroupService.getAuthorizedMenuPaths(adminRole);
		if (allowedMenuPaths == null || allowedMenuPaths.isEmpty()) {
			return false;
		}
		return matchesAnyRequiredMenu(allowedMenuPaths, requestUri);
	}

	private boolean isSharedAuthenticatedApi(String uri) {
		return uri.startsWith("/api/admin/auth/login")
			|| uri.startsWith("/api/admin/auth/session")
			|| uri.startsWith("/api/admin/auth/logout")
			|| uri.startsWith("/api/admin/dashboard")
			|| uri.startsWith("/api/admin/upload")
			|| uri.startsWith("/api/admin/codes/detail");
	}

	private boolean matchesAnyRequiredMenu(List<String> allowedMenuPaths, String uri) {
		if (uri.startsWith("/api/admin/bbs-post")) {
			return matchesBbsPostMenu(allowedMenuPaths, uri);
		}

		String requiredMenu = resolveMenuPrefix(uri);
		if (requiredMenu == null) {
			return true;
		}
		return hasMenuPrefix(allowedMenuPaths, requiredMenu);
	}

	private boolean matchesBbsPostMenu(List<String> allowedMenuPaths, String uri) {
		if (uri.length() > "/api/admin/bbs-post/".length()) {
			String bbsId = uri.substring("/api/admin/bbs-post/".length());
			int slash = bbsId.indexOf('/');
			if (slash >= 0) {
				bbsId = bbsId.substring(0, slash);
			}
			String exact = "/admin/bbs-post/" + bbsId;
			if (allowedMenuPaths.contains(exact)) {
				return true;
			}
		}
		return allowedMenuPaths.stream().anyMatch(path -> path.startsWith("/admin/bbs-post/"));
	}

	private String resolveMenuPrefix(String uri) {
		if (uri.startsWith("/api/admin/admins")) return "/admin/admins";
		if (uri.startsWith("/api/admin/auth/groups")) return "/admin/admin-groups";
		if (uri.startsWith("/api/admin/codes")) return "/admin/codes";
		if (uri.startsWith("/api/admin/homepage-menus")) return "/admin/menus";
		if (uri.startsWith("/api/admin/bbs-master")) return "/admin/bbs-master";
		if (uri.startsWith("/api/admin/site-basic-setting")) return "/admin/basic-setting";
		if (uri.startsWith("/api/admin/access-env")) return "/admin/access-env";
		if (uri.startsWith("/api/admin/history")) return "/admin/history";
		if (uri.startsWith("/api/admin/org-chart")) return "/admin/org-chart";
		if (uri.startsWith("/api/admin/terms")) return "/admin/terms";
		if (uri.startsWith("/api/admin/search-pages")) return "/admin/search-pages";
		if (uri.startsWith("/api/admin/banner")) return "/admin/banners";
		if (uri.startsWith("/api/admin/popup")) return "/admin/popups";
		if (uri.startsWith("/api/admin/access-log")) return "/admin/access-log";
		if (uri.startsWith("/api/admin/user-access-log")) return "/admin/user-access-log";
		if (uri.startsWith("/api/admin/user-visitor-stats")) return "/admin/user-visitor-stats";
		if (uri.startsWith("/api/admin/notification-log")) return "/admin/notification-log";
		if (uri.startsWith("/api/admin/visitor-stats")) return "/admin/visitor-stats";
		if (uri.startsWith("/api/admin/education-program-stats")) return "/admin/education-program-stats";
		if (uri.startsWith("/api/admin/material-download-stats")) return "/admin/material-download-stats";
		if (uri.startsWith("/api/admin/library-books")) return "/admin/library-books";
		if (uri.startsWith("/api/admin/evaluation-forms")) return "/admin/evaluation-forms";
		if (uri.startsWith("/api/admin/survey-forms")) return "/admin/survey-forms";
		if (uri.startsWith("/api/admin/education-contents")) return "/admin/education-contents";
		if (uri.startsWith("/api/admin/field-operation-status")) return "/admin/field-operation-status";
		if (uri.startsWith("/api/admin/learning-calendar")) return "/admin/learning-calendar";
		if (uri.startsWith("/api/admin/learning-results")) return "/admin/learning-results";
		if (uri.startsWith("/api/admin/learning-reservations")) return "/admin/learning-reservations";
		if (uri.startsWith("/api/admin/learning-support-materials")) return "/admin/learning-support-materials";
		if (uri.startsWith("/api/admin/users")) return "/admin/users";
		return null;
	}

	private boolean hasMenuPrefix(List<String> allowedMenuPaths, String prefix) {
		return allowedMenuPaths.stream().anyMatch(path -> path.equals(prefix) || path.startsWith(prefix + "/"));
	}
}
