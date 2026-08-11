package egovframework.tablet.service.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TabletEsdQuestionCheckResponse {
	private boolean correct;
	private String explanation;
}
