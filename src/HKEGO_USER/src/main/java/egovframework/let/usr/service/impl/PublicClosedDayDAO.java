// 공개 화면용 휴관일 기간과 정기휴관 요일 설정을 조회하는 DAO
package egovframework.let.usr.service.impl;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.springframework.stereotype.Repository;

import egovframework.let.usr.service.vo.PublicClosedDayVO;

@Repository("publicClosedDayDAO")
public class PublicClosedDayDAO extends EgovAbstractMapper {
	private static final String NS = "egovframework.let.usr.service.impl.PublicClosedDayDAO.";

	public List<PublicClosedDayVO> selectClosedDaysInRange(String startDate, String endDate) {
		Map<String, Object> param = new HashMap<>();
		param.put("startDate", startDate);
		param.put("endDate", endDate);
		return selectList(NS + "selectClosedDaysInRange", param);
	}

	public String selectRegularClosedDayCode() {
		return selectOne(NS + "selectRegularClosedDayCode");
	}
}
