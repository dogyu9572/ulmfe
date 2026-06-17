package egovframework.let.adm.service.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LibraryBookVO {
	private Integer bookSn;
	private String bookMngNo;
	private String bookNm;
	private String bookImgAtchFileId;
	private String autNm;
	private String pblcoNm;
	private String pblcnYr;
	private String clno;
	private String bookPstnNm;
	private String bookCn;
	private String rcmdtnYn;
	private String rcmdtnClsfCd;
	private String rcmdtnClsfNm;
	private Integer rcmdtnSortSeq;
	private String newBookYr;
	private String newBookMm;
	private String expsrYn;
	private LocalDate regYmd;
	private String wrtrNm;
	private Integer inqCnt;
	private LocalDateTime regDt;
	private String rgtr;
	private LocalDateTime mdfcnDt;
	private String mdtr;
	private LocalDateTime delDt;
	private String deltr;

	@Builder.Default
	private List<LibraryBookVO> relatedBooks = new ArrayList<>();

	@Builder.Default
	private List<Integer> relatedBookSns = new ArrayList<>();
}
