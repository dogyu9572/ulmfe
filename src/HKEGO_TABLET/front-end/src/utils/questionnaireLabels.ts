// 평가지·설문지 객관식 문항의 답변 척도를 응답 유형에 맞게 돌려주는 유틸

const LIKERT5_LABELS = ['매우 그렇다', '그렇다', '보통이다', '아니다', '매우 아니다']
const LEVEL5_LABELS = ['상', '중상', '중', '중하', '하']

/** 관리자가 문항에 지정한 응답 유형(ANS_TYPE_CD)에 맞는 5단계 척도를 돌려준다. */
export const questionnaireAnswerLabels = (answerType: string) =>
	answerType === 'LEVEL5' ? LEVEL5_LABELS : LIKERT5_LABELS
