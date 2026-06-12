package egovframework.let.adm.service.impl;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.springframework.stereotype.Repository;

import egovframework.let.adm.service.vo.CodeDtVO;
import egovframework.let.adm.service.vo.CodeMaVO;

@Repository("codeDAO")
public class CodeDAO extends EgovAbstractMapper {
	private static final String NS = "egovframework.let.adm.service.impl.CodeDAO.";

	public List<CodeMaVO> selectCodeMaList(String useYn) {
		Map<String, Object> param = new HashMap<>();
		param.put("useYn", useYn);
		return selectList(NS + "selectCodeMaList", param);
	}

	public CodeMaVO selectCodeMa(String cdId) {
		Map<String, Object> param = new HashMap<>();
		param.put("cdId", cdId);
		return selectOne(NS + "selectCodeMa", param);
	}

	public List<CodeDtVO> selectCodeDtList(String cdId, String useYn) {
		Map<String, Object> param = new HashMap<>();
		param.put("cdId", cdId);
		param.put("useYn", useYn);
		return selectList(NS + "selectCodeDtList", param);
	}

	public CodeDtVO selectCodeDt(String cdId, String cdDtlId) {
		Map<String, Object> param = new HashMap<>();
		param.put("cdId", cdId);
		param.put("cdDtlId", cdDtlId);
		return selectOne(NS + "selectCodeDt", param);
	}

	public int insertCodeMa(CodeMaVO codeMa) {
		return insert(NS + "insertCodeMa", codeMa);
	}

	public int insertCodeDt(CodeDtVO codeDt) {
		return insert(NS + "insertCodeDt", codeDt);
	}

	public int updateCodeMa(CodeMaVO codeMa) {
		return update(NS + "updateCodeMa", codeMa);
	}

	public int updateCodeDt(CodeDtVO codeDt) {
		return update(NS + "updateCodeDt", codeDt);
	}

	public int deleteCodeMa(String cdId) {
		Map<String, Object> param = new HashMap<>();
		param.put("cdId", cdId);
		return delete(NS + "deleteCodeMa", param);
	}

	public int deleteCodeDt(String cdId, String cdDtlId) {
		Map<String, Object> param = new HashMap<>();
		param.put("cdId", cdId);
		param.put("cdDtlId", cdDtlId);
		return delete(NS + "deleteCodeDt", param);
	}
}
