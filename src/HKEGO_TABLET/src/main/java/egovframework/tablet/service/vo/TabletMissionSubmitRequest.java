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
	private List<TabletMissionAnswerVO> answers;
}
