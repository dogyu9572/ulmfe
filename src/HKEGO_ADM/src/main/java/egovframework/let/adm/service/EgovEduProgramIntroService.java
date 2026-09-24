package egovframework.let.adm.service;

import java.util.List;
import java.util.Map;

import egovframework.let.adm.service.vo.EduProgramIntroVO;

/** 홈페이지 교육프로그램 소개 관리 */
public interface EgovEduProgramIntroService {
	List<EduProgramIntroVO> getIntroList(String prgrmCtgryCd, String useYn, String keyword);
	EduProgramIntroVO getIntro(Integer prgrmIntrdSn);
	EduProgramIntroVO saveIntro(EduProgramIntroVO intro);
	void deleteIntro(Integer prgrmIntrdSn, String deltr);
	void updateIntroSeq(Integer prgrmIntrdSn, Integer sortSeq, String mdtr);
	List<Map<String, Object>> getCategoryCodes();
}
