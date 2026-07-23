package egovframework.let.usr.service.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicHistoryVO {
	private Integer historyId;
	private String year;
	private String month;
	private String content;
	private String imageUrl;
}
