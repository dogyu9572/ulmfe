package egovframework.let.adm.service.impl;

import egovframework.let.adm.service.vo.EducationProgramVO;
import egovframework.let.adm.service.vo.LearningSupportMaterialVO;
import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.springframework.stereotype.Repository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Repository("learningSupportMaterialDAO")
public class LearningSupportMaterialDAO extends EgovAbstractMapper {
	private static final String NS = "egovframework.let.adm.service.impl.LearningSupportMaterialDAO.";

	public int countList(String lrnTypeCd, String dataTypeCd, String startRegYmd, String endRegYmd, String searchType, String searchKeyword) {
		Integer count = selectOne(NS + "countList", searchParam(lrnTypeCd, dataTypeCd, startRegYmd, endRegYmd, searchType, searchKeyword));
		return count == null ? 0 : count;
	}

	public List<LearningSupportMaterialVO> selectList(
		String lrnTypeCd,
		String dataTypeCd,
		String startRegYmd,
		String endRegYmd,
		String searchType,
		String searchKeyword,
		int offset,
		int limit
	) {
		Map<String, Object> param = searchParam(lrnTypeCd, dataTypeCd, startRegYmd, endRegYmd, searchType, searchKeyword);
		param.put("offset", offset);
		param.put("limit", limit);
		return selectList(NS + "selectList", param);
	}

	public LearningSupportMaterialVO findById(String pstSn) {
		return selectOne(NS + "findById", pstSn);
	}

	public int insert(LearningSupportMaterialVO material) {
		return insert(NS + "insert", material);
	}

	public int update(LearningSupportMaterialVO material) {
		return update(NS + "update", material);
	}

	public int delete(String pstSn) {
		return delete(NS + "delete", pstSn);
	}

	public int exists(String pstSn) {
		Integer count = selectOne(NS + "exists", pstSn);
		return count == null ? 0 : count;
	}

	public List<EducationProgramVO> selectActiveProgramOptions() {
		return selectList(NS + "selectActiveProgramOptions");
	}

	private Map<String, Object> searchParam(
		String lrnTypeCd,
		String dataTypeCd,
		String startRegYmd,
		String endRegYmd,
		String searchType,
		String searchKeyword
	) {
		Map<String, Object> param = new HashMap<>();
		param.put("lrnTypeCd", lrnTypeCd);
		param.put("dataTypeCd", dataTypeCd);
		param.put("startRegYmd", startRegYmd);
		param.put("endRegYmd", endRegYmd);
		param.put("searchType", searchType);
		param.put("searchKeyword", searchKeyword);
		return param;
	}
}
