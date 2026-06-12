package egovframework.let.adm.service.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthGroupVO {
	private String authrtCd;
	private String authrtNm;
	private String authrtCn;
	private String useYn;
	private LocalDateTime regDt;
	private LocalDateTime mdfcnDt;
}
