package egovframework.let.adm.service.impl;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.springframework.stereotype.Repository;

import egovframework.let.adm.service.vo.EduProgramIntroVO;

/** 홈페이지 교육프로그램 소개 데이터 접근 */
@Repository("eduProgramIntroDAO")
public class EduProgramIntroDAO extends EgovAbstractMapper {
	private static final String NS = "egovframework.let.adm.service.impl.EduProgramIntroDAO.";

	public List<EduProgramIntroVO> selectIntroList(String prgrmCtgryCd, String useYn, String keyword) {
		Map<String, Object> param = new HashMap<>();
		param.put("prgrmCtgryCd", prgrmCtgryCd);
		param.put("useYn", useYn);
		param.put("keyword", keyword);
		return selectList(NS + "selectIntroList", param);
	}

	public EduProgramIntroVO selectIntro(Integer prgrmIntrdSn) {
		return selectOne(NS + "selectIntro", prgrmIntrdSn);
	}

	public int insertIntro(EduProgramIntroVO intro) {
		return insert(NS + "insertIntro", intro);
	}

	public int updateIntro(EduProgramIntroVO intro) {
		return update(NS + "updateIntro", intro);
	}

	public int deleteIntro(Integer prgrmIntrdSn, String deltr) {
		Map<String, Object> param = new HashMap<>();
		param.put("prgrmIntrdSn", prgrmIntrdSn);
		param.put("deltr", deltr);
		return update(NS + "deleteIntro", param);
	}

	public int updateIntroSeq(Integer prgrmIntrdSn, Integer sortSeq, String mdtr) {
		Map<String, Object> param = new HashMap<>();
		param.put("prgrmIntrdSn", prgrmIntrdSn);
		param.put("sortSeq", sortSeq);
		param.put("mdtr", mdtr);
		return update(NS + "updateIntroSeq", param);
	}

	public Integer selectNextSortSeq() {
		return selectOne(NS + "selectNextSortSeq");
	}

	/** 분류 뱃지 선택지. 공통코드 COM048 에서 사용 중인 값만 내려준다. */
	public List<Map<String, Object>> selectCategoryCodes() {
		return selectList(NS + "selectCategoryCodes");
	}
}
