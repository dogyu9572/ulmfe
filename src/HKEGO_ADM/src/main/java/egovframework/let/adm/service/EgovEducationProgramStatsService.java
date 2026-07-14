package egovframework.let.adm.service;

import java.util.List;

import egovframework.let.adm.service.vo.EducationProgramStatsVO;

public interface EgovEducationProgramStatsService {
	List<EducationProgramStatsVO> getEducationProgramStats(String startDate, String endDate);
}
