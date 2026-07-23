package egovframework.let.usr.service;

import java.util.List;

import egovframework.let.usr.service.vo.PublicHistoryVO;

public interface EgovPublicHistoryService {
	List<PublicHistoryVO> getVisibleHistories();
}
