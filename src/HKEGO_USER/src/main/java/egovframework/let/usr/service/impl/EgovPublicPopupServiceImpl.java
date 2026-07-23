package egovframework.let.usr.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import egovframework.let.usr.service.EgovPublicPopupService;
import egovframework.let.usr.service.vo.PublicPopupVO;
import lombok.RequiredArgsConstructor;

@Service("egovPublicPopupService")
@RequiredArgsConstructor
public class EgovPublicPopupServiceImpl implements EgovPublicPopupService {
	private final PublicPopupDAO publicPopupDAO;

	@Override
	@Transactional(readOnly = true)
	public List<PublicPopupVO> getVisiblePopups() {
		return publicPopupDAO.selectVisiblePopups();
	}
}
