package egovframework.let.usr.service.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicMainBannerVO {
	private Integer bannerId;
	private String name;
	private String mainText;
	private String subText;
	private String linkUrl;
	private String linkTargetCode;
	private String pcImageUrl;
	private String mobileImageUrl;
}
