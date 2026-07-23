package egovframework.let.usr.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import egovframework.let.usr.service.EgovPublicOrganizationService;
import egovframework.let.usr.service.vo.PublicOrganizationMemberVO;
import lombok.RequiredArgsConstructor;

@Service("egovPublicOrganizationService")
@RequiredArgsConstructor
public class EgovPublicOrganizationServiceImpl implements EgovPublicOrganizationService {
	private final PublicOrganizationDAO publicOrganizationDAO;

	@Override
	@Transactional(readOnly = true)
	public List<PublicOrganizationMemberVO> getVisibleMembers() {
		return publicOrganizationDAO.selectVisibleMembers();
	}
}
