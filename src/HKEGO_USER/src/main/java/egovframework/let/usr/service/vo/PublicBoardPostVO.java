package egovframework.let.usr.service.vo;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicBoardPostVO {
	private String boardId;
	private String postId;
	private String title;
	private String content;
	private String writerName;
	private String categoryCode;
	private String categoryName;
	private String noticeYn;
	private String pinnedYn;
	private String newYn;
	private String linkUrl;
	private String publishedDate;
	private String attachmentFileId;
	private String thumbnailFileId;
	private String thumbnailUrl;
	private String videoFileId;
	private String videoUrl;
	private Integer viewCount;
	private LocalDateTime registeredAt;
	private LocalDateTime modifiedAt;
	private String previousPostId;
	private String previousPostTitle;
	private String nextPostId;
	private String nextPostTitle;
	private List<PublicFileInfoVO> attachments;
}
