package egovframework.let.adm.service.vo;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** 홈페이지 교육프로그램 소개 목록에 노출되는 프로그램 한 건. 태블릿 학습용 {@link EducationProgramVO} 와는 별개다. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EduProgramIntroVO {
	private Integer prgrmIntrdSn;
	/** 분류 뱃지. 공통코드 COM048 의 코드값 */
	private String prgrmCtgryCd;
	/** 조회 전용. 목록 API 가 분류명을 함께 내려준다. */
	private String prgrmCtgryNm;
	private String prgrmTtl;
	private String prgrmExpln;
	private String plcCn;
	private String oprtnPdCn;
	private String nopeCn;
	/** 비어 있으면 사용자 화면에서 신청하기 버튼을 숨긴다. */
	private String aplyUrlAddr;
	private String imgFileId;
	/** 조회 전용. 첨부파일 경로와 원본 파일명 */
	private String fileUrl;
	private String fileName;
	private Integer sortSeq;
	private String useYn;
	private String delYn;
	private LocalDateTime regDt;
	private String rgtr;
	private LocalDateTime mdfcnDt;
	private String mdtr;
	private LocalDateTime delDt;
	private String deltr;
}
