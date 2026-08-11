package egovframework.tablet.service.vo;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TabletEsdQuestionVO {
	private Integer questionId;
	private String questionType;
	private String question;
	private String imageUrl;
	@Builder.Default
	private List<String> options = new ArrayList<>();
	@JsonIgnore
	private String optionJson;
	@JsonIgnore
	private String correctAnswerNo;
	@JsonIgnore
	private String correctExplanation;
}
