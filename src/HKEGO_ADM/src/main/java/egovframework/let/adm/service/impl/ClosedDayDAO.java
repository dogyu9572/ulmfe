// 휴관일 목록·상세·등록·수정·삭제와 정기휴관 요일 설정을 조회/저장하는 DAO
package egovframework.let.adm.service.impl;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.springframework.stereotype.Repository;

import egovframework.let.adm.service.vo.ClosedDayVO;

@Repository("closedDayDAO")
public class ClosedDayDAO extends EgovAbstractMapper {
	private static final String NS = "egovframework.let.adm.service.impl.ClosedDayDAO.";

	private Map<String, Object> searchParam(String useYn, String clsrSeCd, String startDate, String endDate, String searchKeyword) {
		Map<String, Object> param = new HashMap<>();
		param.put("useYn", useYn);
		param.put("clsrSeCd", clsrSeCd);
		param.put("startDate", startDate);
		param.put("endDate", endDate);
		param.put("searchKeyword", searchKeyword);
		return param;
	}

	public int selectClosedDayCount(String useYn, String clsrSeCd, String startDate, String endDate, String searchKeyword) {
		Integer count = selectOne(NS + "selectClosedDayCount", searchParam(useYn, clsrSeCd, startDate, endDate, searchKeyword));
		return count == null ? 0 : count;
	}

	public List<ClosedDayVO> selectClosedDayList(
		String useYn, String clsrSeCd, String startDate, String endDate, String searchKeyword, int offset, int limit
	) {
		Map<String, Object> param = searchParam(useYn, clsrSeCd, startDate, endDate, searchKeyword);
		param.put("offset", offset);
		param.put("limit", limit);
		return selectList(NS + "selectClosedDayList", param);
	}

	public ClosedDayVO selectClosedDayById(Long clsrSn) {
		Map<String, Object> param = new HashMap<>();
		param.put("clsrSn", clsrSn);
		return selectOne(NS + "selectClosedDayById", param);
	}

	public int insertClosedDay(ClosedDayVO closedDay) {
		return insert(NS + "insertClosedDay", closedDay);
	}

	public int updateClosedDay(ClosedDayVO closedDay) {
		return update(NS + "updateClosedDay", closedDay);
	}

	public int deleteClosedDay(Long clsrSn, String dltrNm) {
		Map<String, Object> param = new HashMap<>();
		param.put("clsrSn", clsrSn);
		param.put("dltrNm", dltrNm);
		return update(NS + "deleteClosedDay", param);
	}

	public int deleteClosedDays(List<Long> clsrSnList, String dltrNm) {
		Map<String, Object> param = new HashMap<>();
		param.put("clsrSnList", clsrSnList);
		param.put("dltrNm", dltrNm);
		return update(NS + "deleteClosedDays", param);
	}

	public String selectRegularClosedDayCode() {
		return selectOne(NS + "selectRegularClosedDayCode");
	}

	public int updateRegularClosedDayCode(String rglrClsrDayCd, String mdfrNm) {
		Map<String, Object> param = new HashMap<>();
		param.put("rglrClsrDayCd", rglrClsrDayCd);
		param.put("mdfrNm", mdfrNm);
		return update(NS + "updateRegularClosedDayCode", param);
	}
}
