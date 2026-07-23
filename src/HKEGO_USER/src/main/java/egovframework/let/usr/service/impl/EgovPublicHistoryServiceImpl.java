package egovframework.let.usr.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import egovframework.let.usr.service.EgovPublicHistoryService;
import egovframework.let.usr.service.vo.PublicHistoryVO;
import lombok.RequiredArgsConstructor;

@Service("egovPublicHistoryService")
@RequiredArgsConstructor
public class EgovPublicHistoryServiceImpl implements EgovPublicHistoryService {
	private final PublicHistoryDAO publicHistoryDAO;

	@Override
	@Transactional(readOnly = true)
	public List<PublicHistoryVO> getVisibleHistories() {
		return publicHistoryDAO.selectVisibleHistories();
	}
}
