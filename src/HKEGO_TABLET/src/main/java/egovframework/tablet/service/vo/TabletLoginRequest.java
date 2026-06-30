package egovframework.tablet.service.vo;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TabletLoginRequest {
	@NotBlank
	private String userId;

	@NotBlank
	private String password;
}
