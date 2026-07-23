package egovframework.let.usr.service.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicSearchPageVO {
	private Integer searchPageId;
	private String menu1DepthName;
	private String menu2DepthName;
	private String menu3DepthName;
	private String title;
	private String content;
	private String pageUrl;
}
