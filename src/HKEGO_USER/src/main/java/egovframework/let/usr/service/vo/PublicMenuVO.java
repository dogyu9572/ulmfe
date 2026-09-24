package egovframework.let.usr.service.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** 사용자 사이트 헤더가 읽는 홈페이지 메뉴 한 건. 관리자 메뉴 관리에서 바꾼 이름과 노출 여부를 전달한다. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicMenuVO {
	/** 사용자 프론트의 메뉴 항목과 짝을 이루는 코드 */
	private String menuCd;
	private String parentMenuCd;
	private Integer menuDepth;
	/** 관리자가 바꾼 표시 이름 */
	private String menuNm;
	private Integer sortSeq;
}
