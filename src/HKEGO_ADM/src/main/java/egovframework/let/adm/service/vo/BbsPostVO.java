package egovframework.let.adm.service.vo;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BbsPostVO {
	private String bbsId;
	private String pstSn;
	private String pstTtl;
	private String pstCn;
	private String wrtrNm;
	private String wrtrId;
	private Integer sortSeq;
	private String ctgrCd;
	private String ntcYn;
	private String upendFixYn;
	private String lckYn;
	private String lnkgUrlAddr;
	private String pstgYmd;
	@JsonAlias("atchFileId")
	private String atchFileMngNo;
	private String thmbFileId;
	private String vodFileId;
	private String useYn;
	private Integer inqCnt;
	private String etc1;
	private String etc2;
	private String etc3;
	private String etc4;
	private String etc5;
	private String ansSttsCd;
	private String ansCn;
	private String answrNm;
	private String answrId;
	private String ansYmd;
	private LocalDateTime ansDt;
	private LocalDateTime regDt;
	private String rgtr;
	private LocalDateTime mdfcnDt;
	private String mdtr;

	public String getPostId() { return pstSn; }
	public void setPostId(String postId) { this.pstSn = postId; }
	public String getNttSj() { return pstTtl; }
	public void setNttSj(String nttSj) { this.pstTtl = nttSj; }
	public String getNttCn() { return pstCn; }
	public void setNttCn(String nttCn) { this.pstCn = nttCn; }
	public String getNttNm() { return wrtrNm; }
	public void setNttNm(String nttNm) { this.wrtrNm = nttNm; }
	public String getNttId() { return wrtrId; }
	public void setNttId(String nttId) { this.wrtrId = nttId; }
	public Integer getNttSeq() { return sortSeq; }
	public void setNttSeq(Integer nttSeq) { this.sortSeq = nttSeq; }
	public String getCategory() { return ctgrCd; }
	public void setCategory(String category) { this.ctgrCd = category; }
	public String getIsNotice() { return ntcYn; }
	public void setIsNotice(String isNotice) { this.ntcYn = isNotice; }
	public String getIsTop() { return upendFixYn; }
	public void setIsTop(String isTop) { this.upendFixYn = isTop; }
	public String getIsLock() { return lckYn; }
	public void setIsLock(String isLock) { this.lckYn = isLock; }
	public String getNttLink() { return lnkgUrlAddr; }
	public void setNttLink(String nttLink) { this.lnkgUrlAddr = nttLink; }
	public String getNttRegdt() { return pstgYmd; }
	public void setNttRegdt(String nttRegdt) { this.pstgYmd = nttRegdt; }
	public String getThumFileId() { return thmbFileId; }
	public void setThumFileId(String thumFileId) { this.thmbFileId = thumFileId; }
	public String getVdoFileId() { return vodFileId; }
	public void setVdoFileId(String vdoFileId) { this.vodFileId = vdoFileId; }
	public Integer getRdcnt() { return inqCnt; }
	public void setRdcnt(Integer rdcnt) { this.inqCnt = rdcnt; }
	public String getNttEtc1() { return etc1; }
	public void setNttEtc1(String nttEtc1) { this.etc1 = nttEtc1; }
	public String getNttEtc2() { return etc2; }
	public void setNttEtc2(String nttEtc2) { this.etc2 = nttEtc2; }
	public String getNttEtc3() { return etc3; }
	public void setNttEtc3(String nttEtc3) { this.etc3 = nttEtc3; }
	public String getNttEtc4() { return etc4; }
	public void setNttEtc4(String nttEtc4) { this.etc4 = nttEtc4; }
	public String getNttEtc5() { return etc5; }
	public void setNttEtc5(String nttEtc5) { this.etc5 = nttEtc5; }
	public String getAnswerStatus() { return ansSttsCd; }
	public void setAnswerStatus(String answerStatus) { this.ansSttsCd = answerStatus; }
	public String getAnswerContent() { return ansCn; }
	public void setAnswerContent(String answerContent) { this.ansCn = answerContent; }
	public String getAnswererName() { return answrNm; }
	public void setAnswererName(String answererName) { this.answrNm = answererName; }
	public String getAnswererId() { return answrId; }
	public void setAnswererId(String answererId) { this.answrId = answererId; }
	public String getAnswerDate() { return ansYmd; }
	public void setAnswerDate(String answerDate) { this.ansYmd = answerDate; }
	public LocalDateTime getRegdt() { return regDt; }
	public void setRegdt(LocalDateTime regdt) { this.regDt = regdt; }
	public String getRegId() { return rgtr; }
	public void setRegId(String regId) { this.rgtr = regId; }
	public LocalDateTime getModdt() { return mdfcnDt; }
	public void setModdt(LocalDateTime moddt) { this.mdfcnDt = moddt; }
	public String getModId() { return mdtr; }
	public void setModId(String modId) { this.mdtr = modId; }
}
