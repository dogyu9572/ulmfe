package egovframework.let.adm.service.vo;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class LibraryBookDto {
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
	private Integer rcmdtnSortSeq;
	private String newBookYr;
	private String newBookMm;
	private String expsrYn;
	private String regYmd;
	private String wrtrNm;
	private Integer inqCnt;
	private List<Integer> relatedBookSns = new ArrayList<>();
}
