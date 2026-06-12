package egovframework.let.adm.service.impl;

import jakarta.annotation.Resource;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Value;
import org.egovframe.rte.fdl.cmmn.EgovAbstractServiceImpl;

import egovframework.let.adm.service.EgovAdminRolePolicyService;
import egovframework.let.adm.service.EgovCodeService;

import org.springframework.stereotype.Service;

import egovframework.let.adm.service.vo.CodeDtVO;

@Service("egovAdminRolePolicyService")
public class EgovAdminRolePolicyServiceImpl extends EgovAbstractServiceImpl implements EgovAdminRolePolicyService {
	private static final String ROLE_CODE_ID = "COM003";

	@Resource(name = "egovCodeService")
	private EgovCodeService codeService;
	private Set<String> adminManageRoleCodes;
	private String superRoleCode;

	public EgovAdminRolePolicyServiceImpl(
		EgovCodeService codeService,
		@Value("${app.auth.admin-manage-roles:SUPER,MANAGER}") String adminManageRoles,
		@Value("${app.auth.super-role-code:SUPER}") String superRoleCode) {
		this.codeService = codeService;
		this.adminManageRoleCodes = parseCodes(adminManageRoles);
		this.superRoleCode = normalizeCode(superRoleCode);
	}

	public String[] getAdminManagementAuthorities() {
		Set<String> activeCodes = getActiveRoleCodes();
		String[] authorities = adminManageRoleCodes.stream()
			.filter(code -> activeCodes.contains(code))
			.map(this::toAuthority)
			.toArray(String[]::new);
		if (authorities.length == 0) {
			return adminManageRoleCodes.stream()
				.map(this::toAuthority)
				.toArray(String[]::new);
		}
		return authorities;
	}

	public String normalizeAuthority(String roleCode) {
		String normalizedRole = normalizeCode(roleCode);
		if (normalizedRole.isEmpty()) {
			normalizedRole = superRoleCode;
		}
		return toAuthority(normalizedRole);
	}

	public boolean canManageAdmin(String roleCode) {
		String normalizedRole = normalizeCode(roleCode);
		return !normalizedRole.isEmpty()
			&& getActiveRoleCodes().contains(normalizedRole)
			&& adminManageRoleCodes.contains(normalizedRole);
	}

	public boolean isSuperRole(String roleCode) {
		String normalizedRole = normalizeCode(roleCode);
		return !normalizedRole.isEmpty()
			&& getActiveRoleCodes().contains(normalizedRole)
			&& superRoleCode.equals(normalizedRole);
	}

	public String resolveRoleName(String roleCode) {
		String normalizedRole = normalizeCode(roleCode);
		if (normalizedRole.isEmpty()) {
			return "";
		}
		List<CodeDtVO> roles = codeService.getCodeDtList(ROLE_CODE_ID, "Y");
		return roles.stream()
			.filter(role -> normalizedRole.equals(normalizeCode(role.getCdDtlId())))
			.map(CodeDtVO::getCdDtlNm)
			.findFirst()
			.orElse("");
	}

	private Set<String> getActiveRoleCodes() {
		List<CodeDtVO> roles = codeService.getCodeDtList(ROLE_CODE_ID, "Y");
		Set<String> activeCodes = new LinkedHashSet<>();
		for (CodeDtVO role : roles) {
			String code = normalizeCode(role.getCdDtlId());
			if (!code.isEmpty()) {
				activeCodes.add(code);
			}
		}
		if (activeCodes.isEmpty()) {
			return new LinkedHashSet<>(adminManageRoleCodes);
		}
		return activeCodes;
	}

	private Set<String> parseCodes(String csv) {
		Set<String> result = new LinkedHashSet<>();
		if (csv == null || csv.isBlank()) {
			return result;
		}
		for (String token : csv.split(",")) {
			String normalized = normalizeCode(token);
			if (!normalized.isEmpty()) {
				result.add(normalized);
			}
		}
		return result;
	}

	private String normalizeCode(String code) {
		return code == null ? "" : code.trim().toUpperCase();
	}

	private String toAuthority(String roleCode) {
		return roleCode.startsWith("ROLE_") ? roleCode : "ROLE_" + roleCode;
	}
}
