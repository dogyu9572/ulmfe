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
public class FileInfoVO {
	private String atchFileMngNo;
	private Integer fileSeq;
	private String orgnlFileNm;
	private String strgFileNm;
	private String atchFilePathNm;
	private Long fileSz;
	private String fileExtnNm;
	private String fileTypeNm;
	private LocalDateTime regDt;

	public String getFiId() { return atchFileMngNo; }
	public void setFiId(String fiId) { this.atchFileMngNo = fiId; }
	public Integer getFiSn() { return fileSeq; }
	public void setFiSn(Integer fiSn) { this.fileSeq = fiSn; }
	public String getFiOriginName() { return orgnlFileNm; }
	public void setFiOriginName(String fiOriginName) { this.orgnlFileNm = fiOriginName; }
	public String getFiSaveName() { return strgFileNm; }
	public void setFiSaveName(String fiSaveName) { this.strgFileNm = fiSaveName; }
	public String getFiPath() { return atchFilePathNm; }
	public void setFiPath(String fiPath) { this.atchFilePathNm = fiPath; }
	public Long getFiSize() { return fileSz; }
	public void setFiSize(Long fiSize) { this.fileSz = fiSize; }
	public String getFiExt() { return fileExtnNm; }
	public void setFiExt(String fiExt) { this.fileExtnNm = fiExt; }
	public String getFiContentType() { return fileTypeNm; }
	public void setFiContentType(String fiContentType) { this.fileTypeNm = fiContentType; }
	public LocalDateTime getFiCreatedAt() { return regDt; }
	public void setFiCreatedAt(LocalDateTime fiCreatedAt) { this.regDt = fiCreatedAt; }
}
