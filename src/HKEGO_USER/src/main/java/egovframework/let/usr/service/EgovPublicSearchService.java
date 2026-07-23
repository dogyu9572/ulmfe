package egovframework.let.usr.service;

import java.util.List;

import egovframework.let.usr.service.vo.PublicSearchPageVO;

public interface EgovPublicSearchService {
	List<PublicSearchPageVO> searchPages(String keyword);
}
