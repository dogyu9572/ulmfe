package egovframework.tablet.service;

import egovframework.tablet.service.vo.TabletLoginRequest;
import egovframework.tablet.service.vo.TabletLoginResponse;
import egovframework.tablet.service.vo.TabletLearningResourceVO;
import egovframework.tablet.service.vo.TabletMakerAnswerRequest;
import egovframework.tablet.service.vo.TabletMissionFinalSubmitRequest;
import egovframework.tablet.service.vo.TabletMissionSubmitRequest;
import egovframework.tablet.service.vo.TabletQuestionnaireVO;
import egovframework.tablet.service.vo.TabletSessionResponse;
import egovframework.tablet.service.vo.TabletTeacherCallRequest;
import egovframework.tablet.service.vo.TabletTeacherCallVO;
import egovframework.tablet.service.vo.TabletTeacherMessageRequest;
import egovframework.tablet.service.vo.TabletTeacherMessageVO;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

public interface TabletService {
	TabletLoginResponse login(TabletLoginRequest request, HttpServletRequest httpRequest);

	TabletLoginResponse getLoginSession(HttpSession session);

	TabletSessionResponse getTodaySession(String rsvtYmd);

	TabletQuestionnaireVO getQuestionnaireByLink(String linkCd);

	List<TabletLearningResourceVO> getLearningResources(String prgrmTypeCd, Integer prgrmSn);

	String recordLearningResourceDownload(String pstSn, Integer fileSeq);

	List<TabletTeacherCallVO> getTeacherCalls(Integer rsvtSn);

	List<TabletTeacherMessageVO> getTeacherMessages(Integer rsvtSn);

	List<TabletTeacherMessageVO> getUnreadTeacherMessages(Integer rsvtSn, List<Integer> studentSns);

	void markAttendance(Integer rsvtSn, List<Integer> studentSns);

	void submitMission(Integer rsvtSn, TabletMissionSubmitRequest request);

	void submitMissionFiles(Integer rsvtSn, TabletMissionSubmitRequest request, Map<String, MultipartFile> filesByFieldName);

	void submitMaker(Integer rsvtSn, List<TabletMakerAnswerRequest> answers, Map<Integer, MultipartFile> filesByStudentSn);

	void submitMissionFinal(Integer rsvtSn, TabletMissionFinalSubmitRequest request);

	void createTeacherCall(Integer rsvtSn, TabletTeacherCallRequest request);

	void markTeacherCallRead(Long callSn);

	void markAllTeacherCallsRead(Integer rsvtSn);

	void createTeacherMessage(Integer rsvtSn, TabletTeacherMessageRequest request);

	void markTeacherMessageRead(Long msgSn, List<Integer> studentSns);
}
