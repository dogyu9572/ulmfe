package egovframework.let.usr.service.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** 관리자 기본설정에서 정한 사이트 정보. 사용자 사이트의 제목·로고·파비콘·푸터가 이 값을 따른다. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicSiteSettingVO {
	private String siteTitle;
	private String homepageUrl;
	private String managerEmail;
	private String institutionName;
	private String institutionAddress;
	private String institutionTel;
	/** 업로드한 로고 이미지 경로. 비어 있으면 사용자 사이트가 기본 이미지를 쓴다. */
	private String logoUrl;
	/** 업로드한 파비콘 경로. 비어 있으면 사용자 사이트가 기본 파비콘을 쓴다. */
	private String faviconUrl;
	private String footerContent;
	/** application.yml app.kakao.map-app-key. DB 값이 아니라 서버 설정에서 채운다. */
	private String kakaoMapAppKey;
}
