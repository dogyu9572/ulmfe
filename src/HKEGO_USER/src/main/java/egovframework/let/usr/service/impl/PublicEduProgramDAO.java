package egovframework.let.usr.service.impl;

import java.util.List;

import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.springframework.stereotype.Repository;

import egovframework.let.usr.service.vo.PublicEduProgramVO;

@Repository("publicEduProgramDAO")
public class PublicEduProgramDAO extends EgovAbstractMapper {
	private static final String NS = "egovframework.let.usr.service.impl.PublicEduProgramDAO.";

	public List<PublicEduProgramVO> selectVisiblePrograms() {
		return selectList(NS + "selectVisiblePrograms");
	}

	/** 탭에 노출할 분류. 실제로 프로그램이 걸려 있는 분류만 내려준다. */
	public List<PublicEduProgramVO> selectCategories() {
		return selectList(NS + "selectCategories");
	}
}
