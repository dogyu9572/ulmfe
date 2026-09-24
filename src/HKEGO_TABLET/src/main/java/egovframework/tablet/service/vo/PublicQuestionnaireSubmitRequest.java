// 링크·QR로 접속한 익명 응답자가 제출하는 답변 묶음 (문항 지문은 서버 값을 쓰므로 받지 않는다)
package egovframework.tablet.service.vo;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;
import lombok.Data;

@Data
public class PublicQuestionnaireSubmitRequest {
	@NotEmpty
	private List<TabletQuestionnaireAnswerVO> answers;
}
