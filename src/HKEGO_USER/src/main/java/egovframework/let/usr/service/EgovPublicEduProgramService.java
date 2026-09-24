package egovframework.let.usr.service;

import java.util.List;

import egovframework.let.usr.service.vo.PublicEduProgramVO;

/** 교육프로그램 소개 조회 */
public interface EgovPublicEduProgramService {
	List<PublicEduProgramVO> getVisiblePrograms();
	List<PublicEduProgramVO> getCategories();
}
