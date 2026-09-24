package egovframework.let.usr.service.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** 교육프로그램 소개 목록에 노출되는 프로그램 한 건 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicEduProgramVO {
	private Integer programId;
	/** 분류 뱃지 코드와 표기명 */
	private String categoryCode;
	private String categoryName;
	private String title;
	private String description;
	private String place;
	private String period;
	private String capacity;
	/** 비어 있으면 화면에서 신청하기 버튼을 숨긴다. */
	private String applyUrl;
	private String thumbnailUrl;
}
