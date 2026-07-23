package egovframework.let.usr.service.impl;

import java.util.List;

import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.springframework.stereotype.Repository;

import egovframework.let.usr.service.vo.PublicHistoryVO;

@Repository("publicHistoryDAO")
public class PublicHistoryDAO extends EgovAbstractMapper {
	private static final String NS = "egovframework.let.usr.service.impl.PublicHistoryDAO.";

	public List<PublicHistoryVO> selectVisibleHistories() {
		return selectList(NS + "selectVisibleHistories");
	}
}
