package egovframework.let.adm.service.impl;

import jakarta.annotation.Resource;
import egovframework.let.adm.service.vo.CodeDtVO;
import egovframework.let.adm.service.vo.CodeMaVO;
import egovframework.let.adm.service.impl.CodeDAO;
import lombok.extern.slf4j.Slf4j;
import org.egovframe.rte.fdl.cmmn.EgovAbstractServiceImpl;

import egovframework.let.adm.service.EgovCodeService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service("egovCodeService")
public class EgovCodeServiceImpl extends EgovAbstractServiceImpl implements EgovCodeService {
	@Resource(name = "codeDAO")
	private CodeDAO codeDAO;

	public List<CodeMaVO> getCodeMaList(String useYn) {
		return codeDAO.selectCodeMaList(useYn);
	}

	public CodeMaVO getCodeMa(String cdId) {
		return codeDAO.selectCodeMa(cdId);
	}

	public List<CodeDtVO> getCodeDtList(String cdId, String useYn) {
		return codeDAO.selectCodeDtList(cdId, useYn);
	}

	@Transactional
	public void createCodeMa(CodeMaVO codeMa) {
		normalizeCodeMa(codeMa);
		CodeMaVO existing = codeDAO.selectCodeMa(codeMa.getCdId());
		if (existing != null) {
			throw new RuntimeException("이미 존재하는 코드ID입니다: " + codeMa.getCdId());
		}
		codeDAO.insertCodeMa(codeMa);
	}

	@Transactional
	public void createCodeDt(CodeDtVO codeDt) {
		normalizeCodeDt(codeDt);
		CodeDtVO existing = codeDAO.selectCodeDt(codeDt.getCdId(), codeDt.getCdDtlId());
		if (existing != null) {
			throw new RuntimeException("이미 존재하는 코드값입니다: " + codeDt.getCdDtlId());
		}
		codeDAO.insertCodeDt(codeDt);
	}

	@Transactional
	public int updateCodeMa(CodeMaVO codeMa) {
		normalizeCodeMa(codeMa);
		return codeDAO.updateCodeMa(codeMa);
	}

	@Transactional
	public int updateCodeDt(CodeDtVO codeDt) {
		normalizeCodeDt(codeDt);
		return codeDAO.updateCodeDt(codeDt);
	}

	private void normalizeCodeMa(CodeMaVO codeMa) {
		if (codeMa.getUseYn() == null || codeMa.getUseYn().isBlank()) {
			codeMa.setUseYn("Y");
		}
	}

	private void normalizeCodeDt(CodeDtVO codeDt) {
		if (codeDt.getSeq() == null) {
			codeDt.setSeq(0);
		}
		if (codeDt.getUseYn() == null || codeDt.getUseYn().isBlank()) {
			codeDt.setUseYn("Y");
		}
		if (codeDt.getRgtr() == null || codeDt.getRgtr().isBlank()) {
			codeDt.setRgtr("admin");
		}
	}

	@Transactional
	public void deleteCodeMa(String cdId) {
		List<CodeDtVO> details = codeDAO.selectCodeDtList(cdId, null);
		if (!details.isEmpty()) {
			throw new RuntimeException("해당 코드ID에 상세 코드가 있어 삭제할 수 없습니다.");
		}
		codeDAO.deleteCodeMa(cdId);
	}

	@Transactional
	public void deleteCodeDt(String cdId, String cdDtlId) {
		codeDAO.deleteCodeDt(cdId, cdDtlId);
	}
}

