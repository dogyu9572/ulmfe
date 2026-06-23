package egovframework.let.adm.service;

import egovframework.let.adm.service.vo.EducationProgramVO;
import egovframework.let.adm.service.vo.LearningSupportMaterialVO;

import java.util.List;
import java.util.Map;

public interface EgovLearningSupportMaterialService {
	Map<String, Object> getLearningSupportMaterialListPage(
		String lrnTypeCd,
		String dataTypeCd,
		String startRegYmd,
		String endRegYmd,
		String searchType,
		String searchKeyword,
		int page,
		int size
	);

	LearningSupportMaterialVO getLearningSupportMaterialById(String pstSn);

	LearningSupportMaterialVO createLearningSupportMaterial(LearningSupportMaterialVO material);

	LearningSupportMaterialVO updateLearningSupportMaterial(String pstSn, LearningSupportMaterialVO material);

	void deleteLearningSupportMaterial(String pstSn);

	List<EducationProgramVO> getActiveProgramOptions();
}
