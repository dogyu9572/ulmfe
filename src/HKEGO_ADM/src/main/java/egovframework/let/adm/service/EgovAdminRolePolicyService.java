package egovframework.let.adm.service;

public interface EgovAdminRolePolicyService {
	String[] getAdminManagementAuthorities();
	String normalizeAuthority(String roleCode);
	boolean canManageAdmin(String roleCode);
	boolean isSuperRole(String roleCode);
	String resolveRoleName(String roleCode);
}
