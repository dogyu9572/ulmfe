package egovframework.let.adm.service.vo;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthInfoVO {
	private String authrtCd;
	private String menuCd;
	private String rgtr;
	private LocalDateTime regDt;
}
