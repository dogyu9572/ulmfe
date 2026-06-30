package egovframework.tablet.service.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TabletLoginResponse {
	private boolean valid;
	private String adminId;
	private String adminName;
	private String adminRole;
}
