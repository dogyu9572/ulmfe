package egovframework.let.usr.service.impl;

import java.util.List;

import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.springframework.stereotype.Repository;

import egovframework.let.usr.service.vo.PublicOrganizationMemberVO;

@Repository("publicOrganizationDAO")
public class PublicOrganizationDAO extends EgovAbstractMapper {
	private static final String NS = "egovframework.let.usr.service.impl.PublicOrganizationDAO.";

	public List<PublicOrganizationMemberVO> selectVisibleMembers() {
		return selectList(NS + "selectVisibleMembers");
	}
}
