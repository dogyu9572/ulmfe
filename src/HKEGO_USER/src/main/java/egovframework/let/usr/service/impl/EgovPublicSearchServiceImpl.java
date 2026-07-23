package egovframework.let.usr.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import egovframework.let.usr.service.EgovPublicSearchService;
import egovframework.let.usr.service.vo.PublicSearchPageVO;
import lombok.RequiredArgsConstructor;

@Service("egovPublicSearchService")
@RequiredArgsConstructor
public class EgovPublicSearchServiceImpl implements EgovPublicSearchService {
	private final PublicSearchDAO publicSearchDAO;

	@Override
	@Transactional(readOnly = true)
	public List<PublicSearchPageVO> searchPages(String keyword) {
		if (keyword == null || keyword.isBlank()) {
			return List.of();
		}
		return publicSearchDAO.searchPages(keyword.trim());
	}
}
