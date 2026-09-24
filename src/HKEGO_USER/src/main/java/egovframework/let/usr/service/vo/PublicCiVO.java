package egovframework.let.usr.service.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicCiVO {
	private Integer ciId;
	/** SYMBOL(심벌마크) / SIGN(시그니처) / CHAR(캐릭터) / FILE(통합 다운로드 파일) */
	private String seCd;
	private String title;
	/** 이미지 구분은 노출 경로, FILE 구분은 다운로드 경로다. */
	private String fileUrl;
	/** FILE 구분에서 내려받을 때 쓰는 원본 파일명 */
	private String fileName;
}
