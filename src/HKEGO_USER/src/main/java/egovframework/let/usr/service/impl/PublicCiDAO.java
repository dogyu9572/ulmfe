package egovframework.let.usr.service.impl;

import java.util.List;

import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.springframework.stereotype.Repository;

import egovframework.let.usr.service.vo.PublicCiVO;

@Repository("publicCiDAO")
public class PublicCiDAO extends EgovAbstractMapper {
	private static final String NS = "egovframework.let.usr.service.impl.PublicCiDAO.";

	public List<PublicCiVO> selectVisibleCiItems() {
		return selectList(NS + "selectVisibleCiItems");
	}
}
