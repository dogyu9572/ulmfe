package egovframework.let.adm.service;

import egovframework.let.adm.service.vo.EducationProgramDto;
import egovframework.let.adm.service.vo.EducationProgramVO;

import java.util.Map;

public interface EgovEducationProgramService {
	Map<String, Object> getEducationProgramListPage(String prgrmTypeCd, String useYn, String searchKeyword, int page, int size);

	EducationProgramVO getEducationProgramById(String prgrmTypeCd, Integer prgrmSn);

	EducationProgramVO createEducationProgram(String prgrmTypeCd, EducationProgramDto dto);

	EducationProgramVO updateEducationProgram(String prgrmTypeCd, Integer prgrmSn, EducationProgramDto dto);

	void deleteEducationProgram(String prgrmTypeCd, Integer prgrmSn);
}
