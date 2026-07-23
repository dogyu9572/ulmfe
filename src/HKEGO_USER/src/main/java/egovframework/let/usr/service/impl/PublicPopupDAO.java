package egovframework.let.usr.service.impl;

import java.util.List;

import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.springframework.stereotype.Repository;

import egovframework.let.usr.service.vo.PublicPopupVO;

@Repository("publicPopupDAO")
public class PublicPopupDAO extends EgovAbstractMapper {
	private static final String NS = "egovframework.let.usr.service.impl.PublicPopupDAO.";

	public List<PublicPopupVO> selectVisiblePopups() {
		return selectList(NS + "selectVisiblePopups");
	}
}
