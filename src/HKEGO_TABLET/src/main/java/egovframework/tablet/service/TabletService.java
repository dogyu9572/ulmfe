package egovframework.tablet.service;

import egovframework.tablet.service.vo.TabletLoginRequest;
import egovframework.tablet.service.vo.TabletLoginResponse;
import egovframework.tablet.service.vo.TabletLearningResourceVO;
import egovframework.tablet.service.vo.TabletMissionFinalSubmitRequest;
import egovframework.tablet.service.vo.TabletMissionSubmitRequest;
import egovframework.tablet.service.vo.TabletSessionResponse;
import egovframework.tablet.service.vo.TabletTeacherCallRequest;
import egovframework.tablet.service.vo.TabletTeacherCallVO;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

import java.util.List;

public interface TabletService {
	TabletLoginResponse login(TabletLoginRequest request, HttpServletRequest httpRequest);

	TabletLoginResponse getLoginSession(HttpSession session);

	TabletSessionResponse getTodaySession(String rsvtYmd);

	List<TabletLearningResourceVO> getLearningResources(String prgrmTypeCd, Integer prgrmSn);

	List<TabletTeacherCallVO> getTeacherCalls(Integer rsvtSn);

	void markAttendance(Integer rsvtSn, List<Integer> studentSns);

	void submitMission(Integer rsvtSn, TabletMissionSubmitRequest request);

	void submitMissionFinal(Integer rsvtSn, TabletMissionFinalSubmitRequest request);

	void createTeacherCall(Integer rsvtSn, TabletTeacherCallRequest request);

	void markTeacherCallRead(Long callSn);

	void markAllTeacherCallsRead(Integer rsvtSn);
}
