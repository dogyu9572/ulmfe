package egovframework.let.usr.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import egovframework.let.usr.service.EgovPublicCiService;
import egovframework.let.usr.service.vo.PublicCiVO;
import lombok.RequiredArgsConstructor;

@Service("egovPublicCiService")
@RequiredArgsConstructor
public class EgovPublicCiServiceImpl implements EgovPublicCiService {
	private final PublicCiDAO publicCiDAO;

	@Override
	@Transactional(readOnly = true)
	public List<PublicCiVO> getVisibleCiItems() {
		return publicCiDAO.selectVisibleCiItems();
	}
}
