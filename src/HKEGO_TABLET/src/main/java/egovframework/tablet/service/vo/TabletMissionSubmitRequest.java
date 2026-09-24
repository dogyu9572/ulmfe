package egovframework.tablet.service.vo;

import lombok.Data;

import java.util.List;

@Data
public class TabletMissionSubmitRequest {
	private List<Integer> studentSns;
	private Integer routeIndex;
	private String routeName;
	private String stepCd;
	private Integer totalRouteCount;
	/** 이 단계를 시작한 뒤 흐른 시간(초). 시작 시각을 거슬러 계산해 소요시간을 남긴다. */
	private Integer elapsedSeconds;
	private List<TabletMissionAnswerVO> answers;
}
