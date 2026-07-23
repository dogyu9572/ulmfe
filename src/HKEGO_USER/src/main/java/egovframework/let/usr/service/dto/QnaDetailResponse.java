package egovframework.let.usr.service.dto;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class QnaDetailResponse {
	private String postId;
	private String title;
	private String content;
	private String writerName;
	private LocalDateTime registeredAt;
	private LocalDateTime modifiedAt;
	private String publishedDate;
	private Integer viewCount;
	private String answerStatus;
	private String answerContent;
	private String answererName;
	private String answerDate;
	private LocalDateTime answeredAt;
	private boolean passwordProtected;
}
