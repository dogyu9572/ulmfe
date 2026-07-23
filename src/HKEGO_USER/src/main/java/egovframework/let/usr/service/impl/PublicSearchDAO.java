package egovframework.let.usr.service.impl;

import java.util.List;

import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.springframework.stereotype.Repository;

import egovframework.let.usr.service.vo.PublicSearchPageVO;

@Repository("publicSearchDAO")
public class PublicSearchDAO extends EgovAbstractMapper {
	private static final String NS = "egovframework.let.usr.service.impl.PublicSearchDAO.";

	public List<PublicSearchPageVO> searchPages(String keyword) {
		return selectList(NS + "searchPages", keyword);
	}
}
