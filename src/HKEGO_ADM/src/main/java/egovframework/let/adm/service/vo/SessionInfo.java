package egovframework.let.adm.service.vo;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SessionInfo {
	private boolean valid;
	private String adminId;
	private String adminName;
	private String adminRole;
	private String adminRoleName;
	private boolean canManageAdmin;
	private boolean superAdmin;
	private List<String> allowedMenuPaths;
	private int remainingSeconds;
}
