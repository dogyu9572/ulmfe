package egovframework.tablet.service.mapper;

import egovframework.tablet.service.vo.TabletAdminVO;
import egovframework.tablet.service.vo.TabletContentQuestionVO;
import egovframework.tablet.service.vo.TabletContentVO;
import egovframework.tablet.service.vo.TabletReservationVO;
import egovframework.tablet.service.vo.TabletStudentVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface TabletMapper {
	TabletAdminVO findAdminById(String id);

	void updateAdminLastLogin(String id);

	TabletReservationVO findReservationByDate(String rsvtYmd);

	List<TabletStudentVO> selectStudents(Integer rsvtSn);

	List<TabletContentVO> selectContentsByIds(@Param("contentIds") List<Integer> contentIds);

	List<TabletContentVO> selectContentsByNames(@Param("contentNames") List<String> contentNames);

	List<TabletContentQuestionVO> selectContentQuestions(@Param("contentIds") List<Integer> contentIds);

	void syncAttendance(@Param("rsvtSn") Integer rsvtSn, @Param("studentSns") List<Integer> studentSns);
}
