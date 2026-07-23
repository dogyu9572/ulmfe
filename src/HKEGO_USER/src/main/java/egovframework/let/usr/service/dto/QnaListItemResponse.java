package egovframework.let.usr.service.dto;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class QnaListItemResponse {
	private String postId;
	private String title;
	private String writerNameMasked;
	private LocalDateTime registeredAt;
	private String publishedDate;
	private String answerStatus;
	private boolean passwordProtected;
}
