package egovframework.let.adm.service.vo;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LoginResponse {
	private String token;
	private String adminId;
	private String adminName;
	private String role;
}

