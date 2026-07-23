package egovframework.let.usr.service.vo;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicFileInfoVO {
	private String fileId;
	private Integer fileSeq;
	private String originalFileName;
	private String storedFileName;
	private String fileUrl;
	private Long fileSize;
	private String fileExtension;
	private String contentType;
	private LocalDateTime registeredAt;
}
