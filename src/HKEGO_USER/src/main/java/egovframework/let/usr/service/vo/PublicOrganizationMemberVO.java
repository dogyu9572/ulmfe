package egovframework.let.usr.service.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicOrganizationMemberVO {
	private Integer organizationMemberId;
	private String firstCategoryCode;
	private String firstCategoryName;
	private String secondCategoryCode;
	private String secondCategoryName;
	private String task;
	private String telephone;
	private Integer sortSequence;
}
