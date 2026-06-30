package egovframework.tablet.service.mapper;

import egovframework.tablet.service.vo.TabletAdminVO;
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

	void markAttendance(@Param("rsvtSn") Integer rsvtSn, @Param("studentSns") List<Integer> studentSns);
}
