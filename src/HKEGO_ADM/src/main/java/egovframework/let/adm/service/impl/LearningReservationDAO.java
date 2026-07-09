package egovframework.let.adm.service.impl;

import egovframework.let.adm.service.vo.LearningReservationStudentVO;
import egovframework.let.adm.service.vo.LearningReservationVO;
import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.springframework.stereotype.Repository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Repository("learningReservationDAO")
public class LearningReservationDAO extends EgovAbstractMapper {
	private static final String NS = "egovframework.let.adm.service.impl.LearningReservationDAO.";

	public int countLearningReservationList(
		String lrnSttsCd,
		String prgrmTypeCd,
		String startRsvtYmd,
		String endRsvtYmd,
		String searchType,
		String searchKeyword
	) {
		Integer count = selectOne(NS + "countLearningReservationList", searchParam(lrnSttsCd, prgrmTypeCd, startRsvtYmd, endRsvtYmd, searchType, searchKeyword));
		return count == null ? 0 : count;
	}

	public List<LearningReservationVO> selectLearningReservationList(
		String lrnSttsCd,
		String prgrmTypeCd,
		String startRsvtYmd,
		String endRsvtYmd,
		String searchType,
		String searchKeyword,
		int offset,
		int limit
	) {
		Map<String, Object> param = searchParam(lrnSttsCd, prgrmTypeCd, startRsvtYmd, endRsvtYmd, searchType, searchKeyword);
		param.put("offset", offset);
		param.put("limit", limit);
		return selectList(NS + "selectLearningReservationList", param);
	}

	public LearningReservationVO findById(Integer rsvtSn) {
		return selectOne(NS + "findById", rsvtSn);
	}

	public Integer selectNextReservationSeq(String rsvtNoPrefix) {
		return selectOne(NS + "selectNextReservationSeq", rsvtNoPrefix);
	}

	public Integer selectProgramSnByName(String prgrmTypeCd, String prgrmNm) {
		Map<String, Object> param = new HashMap<>();
		param.put("prgrmTypeCd", prgrmTypeCd);
		param.put("prgrmNm", prgrmNm);
		return selectOne(NS + "selectProgramSnByName", param);
	}

	public int insert(LearningReservationVO reservation) {
		return insert(NS + "insert", reservation);
	}

	public int update(LearningReservationVO reservation) {
		return update(NS + "update", reservation);
	}

	public int delete(Integer rsvtSn) {
		return update(NS + "delete", rsvtSn);
	}

	public List<LearningReservationStudentVO> selectStudents(Integer rsvtSn) {
		return selectList(NS + "selectStudents", rsvtSn);
	}

	public int deleteStudents(Integer rsvtSn) {
		return update(NS + "deleteStudents", rsvtSn);
	}

	public int deleteStudentsExcept(Integer rsvtSn, List<Integer> keepStudentSns) {
		Map<String, Object> param = new HashMap<>();
		param.put("rsvtSn", rsvtSn);
		param.put("keepStudentSns", keepStudentSns);
		return update(NS + "deleteStudentsExcept", param);
	}

	public int insertStudent(LearningReservationStudentVO student) {
		return insert(NS + "insertStudent", student);
	}

	public int updateStudent(LearningReservationStudentVO student) {
		return update(NS + "updateStudent", student);
	}

	public int updateActualStudentCount(Integer rsvtSn) {
		return update(NS + "updateActualStudentCount", rsvtSn);
	}

	private Map<String, Object> searchParam(
		String lrnSttsCd,
		String prgrmTypeCd,
		String startRsvtYmd,
		String endRsvtYmd,
		String searchType,
		String searchKeyword
	) {
		Map<String, Object> param = new HashMap<>();
		param.put("lrnSttsCd", lrnSttsCd);
		param.put("prgrmTypeCd", prgrmTypeCd);
		param.put("startRsvtYmd", startRsvtYmd);
		param.put("endRsvtYmd", endRsvtYmd);
		param.put("searchType", searchType);
		param.put("searchKeyword", searchKeyword);
		return param;
	}
}
