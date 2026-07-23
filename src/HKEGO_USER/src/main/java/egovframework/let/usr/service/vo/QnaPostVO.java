package egovframework.let.usr.service.vo;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class QnaPostVO {
	private String postId;
	private String title;
	private String content;
	private String writerName;
	private String lockYn;
	private String passwordHash;
	private String publishedDate;
	private Integer viewCount;
	private String answerStatus;
	private String answerContent;
	private String answererName;
	private String answerDate;
	private LocalDateTime answeredAt;
	private LocalDateTime registeredAt;
	private LocalDateTime modifiedAt;
}
