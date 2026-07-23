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
public class PublicTermsVO {
	private Integer termsId;
	private String termsTypeCode;
	private String termsTypeName;
	private String title;
	private String content;
	private LocalDateTime registeredAt;
	private LocalDateTime modifiedAt;
}
