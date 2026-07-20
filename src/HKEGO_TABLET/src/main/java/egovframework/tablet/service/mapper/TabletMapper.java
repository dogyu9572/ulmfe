package egovframework.tablet.service.mapper;

import egovframework.tablet.service.vo.TabletAdminVO;
import egovframework.tablet.service.vo.TabletContentQuestionVO;
import egovframework.tablet.service.vo.TabletContentVO;
import egovframework.tablet.service.vo.TabletLearningResourceVO;
import egovframework.tablet.service.vo.TabletMissionAnswerVO;
import egovframework.tablet.service.vo.TabletProgressLogVO;
import egovframework.tablet.service.vo.TabletQuestionnaireAnswerVO;
import egovframework.tablet.service.vo.TabletQuestionnaireQuestionVO;
import egovframework.tablet.service.vo.TabletQuestionnaireVO;
import egovframework.tablet.service.vo.TabletReservationVO;
import egovframework.tablet.service.vo.TabletSavedAnswerVO;
import egovframework.tablet.service.vo.TabletStudentVO;
import egovframework.tablet.service.vo.TabletTeacherCallVO;
import egovframework.tablet.service.vo.TabletTeacherMessageVO;
import egovframework.tablet.service.vo.TabletPushDeviceVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface TabletMapper {
	TabletAdminVO findAdminById(String id);

	void updateAdminLastLogin(String id);

	TabletReservationVO findReservationByDate(@Param("rsvtYmd") String rsvtYmd, @Param("currentHm") String currentHm);

	List<TabletStudentVO> selectStudents(Integer rsvtSn);

	List<TabletContentVO> selectContentsByIds(@Param("contentIds") List<Integer> contentIds);

	List<TabletContentVO> selectContentsByNames(@Param("contentNames") List<String> contentNames);

	List<TabletContentQuestionVO> selectContentQuestions(@Param("contentIds") List<Integer> contentIds);

	List<TabletProgressLogVO> selectProgressLogs(Integer rsvtSn);

	List<TabletSavedAnswerVO> selectSavedAnswers(Integer rsvtSn);

	List<TabletQuestionnaireQuestionVO> selectQuestionnaireQuestions(@Param("qstnrSn") Integer qstnrSn, @Param("qstnrTypeCd") String qstnrTypeCd);

	List<TabletQuestionnaireQuestionVO> selectQuestionnaireQuestionsByName(@Param("qstnrNm") String qstnrNm, @Param("qstnrTypeCd") String qstnrTypeCd);

	TabletQuestionnaireVO selectQuestionnaireByLink(
		@Param("qstnrSn") Integer qstnrSn,
		@Param("qstnrTypeCd") String qstnrTypeCd,
		@Param("evlSeCd") String evlSeCd
	);

	List<TabletLearningResourceVO> selectLearningResources(@Param("prgrmTypeCd") String prgrmTypeCd, @Param("prgrmSn") Integer prgrmSn);

	TabletLearningResourceVO selectLearningResourceTarget(@Param("pstSn") String pstSn, @Param("fileSeq") Integer fileSeq);

	void insertLearningResourceDownloadLog(TabletLearningResourceVO resource);

	List<TabletTeacherCallVO> selectTeacherCalls(Integer rsvtSn);

	void insertTeacherCall(TabletTeacherCallVO teacherCall);

	int updateTeacherCallRead(Long callSn);

	int updateAllTeacherCallsRead(Integer rsvtSn);

	List<TabletTeacherMessageVO> selectTeacherMessages(Integer rsvtSn);

	List<TabletTeacherMessageVO> selectUnreadTeacherMessages(@Param("rsvtSn") Integer rsvtSn, @Param("studentSns") List<Integer> studentSns);

	void insertTeacherMessage(TabletTeacherMessageVO teacherMessage);

	void insertTeacherMessageRecipients(@Param("msgSn") Long msgSn, @Param("rsvtSn") Integer rsvtSn, @Param("studentSns") List<Integer> studentSns);

	int updateTeacherMessageRead(@Param("msgSn") Long msgSn, @Param("studentSns") List<Integer> studentSns);

	void syncAttendance(@Param("rsvtSn") Integer rsvtSn, @Param("studentSns") List<Integer> studentSns);

	void deleteMissionAnswers(@Param("rsvtSn") Integer rsvtSn, @Param("stdntSn") Integer stdntSn, @Param("stepCd") String stepCd);

	void insertMissionAnswer(@Param("rsvtSn") Integer rsvtSn, @Param("stdntSn") Integer stdntSn, @Param("stepCd") String stepCd, @Param("answer") TabletMissionAnswerVO answer);

	void deleteTypedAnswers(@Param("rsvtSn") Integer rsvtSn, @Param("stdntSn") Integer stdntSn, @Param("ansTypeCd") String ansTypeCd);

	void insertTypedAnswer(@Param("rsvtSn") Integer rsvtSn, @Param("stdntSn") Integer stdntSn, @Param("ansTypeCd") String ansTypeCd, @Param("stepCd") String stepCd, @Param("answer") TabletQuestionnaireAnswerVO answer);

	int updateProgressLogDone(@Param("rsvtSn") Integer rsvtSn, @Param("stdntSn") Integer stdntSn, @Param("stepCd") String stepCd, @Param("actvtNm") String actvtNm);

	void insertProgressLogDone(@Param("rsvtSn") Integer rsvtSn, @Param("stdntSn") Integer stdntSn, @Param("stepCd") String stepCd, @Param("actvtNm") String actvtNm);

	void updateStudentProgress(@Param("rsvtSn") Integer rsvtSn, @Param("stdntSn") Integer stdntSn, @Param("progressRate") Integer progressRate, @Param("learningStatus") String learningStatus);

	int countReservation(Integer rsvtSn);

	void deactivatePushDevicesByToken(@Param("deviceId") String deviceId, @Param("fcmToken") String fcmToken);

	void upsertPushDevice(TabletPushDeviceVO device);

	int deactivatePushDevice(String deviceId);

	void deletePushDeviceStudents(String deviceId);

	void insertPushDeviceStudents(@Param("deviceId") String deviceId, @Param("rsvtSn") Integer rsvtSn, @Param("studentSns") List<Integer> studentSns);

	List<String> selectTeacherPushTokens(Integer rsvtSn);

	List<String> selectStudentPushTokens(@Param("rsvtSn") Integer rsvtSn, @Param("studentSns") List<Integer> studentSns);

	int deactivatePushDeviceByToken(String fcmToken);
}
