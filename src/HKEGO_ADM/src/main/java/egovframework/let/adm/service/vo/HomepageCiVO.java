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
public class HomepageCiVO {
	private Integer ciSn;
	/** SYMBOL(심벌마크) / SIGN(시그니처) / CHAR(캐릭터) / FILE(통합 다운로드 파일) */
	private String ciSeCd;
	private String ciTtl;
	private String imgFileId;
	/** 조회 전용. IMG_FILE_ID로 이어진 첨부파일의 경로와 원본 파일명이다. */
	private String fileUrl;
	private String fileName;
	/** 구분별로 독립 배정되는 노출 순서 */
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
