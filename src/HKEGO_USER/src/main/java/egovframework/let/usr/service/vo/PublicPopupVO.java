package egovframework.let.usr.service.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicPopupVO {
	private Long popupId;
	private String name;
	private String content;
	private Integer positionX;
	private Integer positionY;
	private Integer width;
	private Integer height;
	private String linkUrl;
	private String linkTargetCode;
	private String imageUrl;
}
