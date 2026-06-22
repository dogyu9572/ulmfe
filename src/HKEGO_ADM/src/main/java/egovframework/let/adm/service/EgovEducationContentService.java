package egovframework.let.adm.service;

import egovframework.let.adm.service.vo.EducationContentDto;
import egovframework.let.adm.service.vo.EducationContentVO;

import java.util.Map;

public interface EgovEducationContentService {
	Map<String, Object> getEducationContentListPage(
		String cntnTypeCd,
		String cardClsfCd,
		String useYn,
		String searchKeyword,
		int page,
		int size
	);

	EducationContentVO getEducationContentById(Integer cntnSn);

	EducationContentVO createEducationContent(EducationContentDto dto);

	EducationContentVO updateEducationContent(Integer cntnSn, EducationContentDto dto);

	void deleteEducationContent(Integer cntnSn);
}
