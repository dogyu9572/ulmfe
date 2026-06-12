package egovframework.let.adm.service;

import java.util.List;

import egovframework.let.adm.service.vo.CodeDtVO;
import egovframework.let.adm.service.vo.CodeMaVO;

public interface EgovCodeService {
	List<CodeMaVO> getCodeMaList(String useYn);
	CodeMaVO getCodeMa(String codeId);
	List<CodeDtVO> getCodeDtList(String codeId, String useYn);
	void createCodeMa(CodeMaVO codeMa);
	void createCodeDt(CodeDtVO codeDt);
	void updateCodeMa(CodeMaVO codeMa);
	void updateCodeDt(CodeDtVO codeDt);
	void deleteCodeMa(String codeId);
	void deleteCodeDt(String codeId, String code);
}
