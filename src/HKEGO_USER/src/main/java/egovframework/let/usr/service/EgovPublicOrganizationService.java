package egovframework.let.usr.service;

import java.util.List;

import egovframework.let.usr.service.vo.PublicOrganizationMemberVO;

public interface EgovPublicOrganizationService {
	List<PublicOrganizationMemberVO> getVisibleMembers();
}
