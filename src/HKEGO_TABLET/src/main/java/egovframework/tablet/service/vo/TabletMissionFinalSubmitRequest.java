package egovframework.tablet.service.vo;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class TabletMissionFinalSubmitRequest {
	private List<Integer> studentSns = new ArrayList<>();
	private String heroName;
	private Boolean updateHero;
	private Boolean updateEvaluation;
	private Boolean updateSurvey;
	private Boolean complete;
	private List<TabletQuestionnaireAnswerVO> evaluationAnswers = new ArrayList<>();
	private List<TabletQuestionnaireAnswerVO> surveyAnswers = new ArrayList<>();
}
