package egovframework.let.adm.service.vo;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class NotificationSendLogVO {
	private String logKey;
	private LocalDateTime sendDt;
	private String schlNm;
	private String targetCd;
	private String targetNm;
	private String content;
	private String successYn;
	private String successNm;
}
