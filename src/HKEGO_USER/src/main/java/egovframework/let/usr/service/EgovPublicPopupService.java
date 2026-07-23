package egovframework.let.usr.service;

import java.util.List;

import egovframework.let.usr.service.vo.PublicPopupVO;

public interface EgovPublicPopupService {
	List<PublicPopupVO> getVisiblePopups();
}
