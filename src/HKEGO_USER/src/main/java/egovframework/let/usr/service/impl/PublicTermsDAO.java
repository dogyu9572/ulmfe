package egovframework.let.usr.service.impl;

import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.springframework.stereotype.Repository;

import egovframework.let.usr.service.vo.PublicTermsVO;

@Repository("publicTermsDAO")
public class PublicTermsDAO extends EgovAbstractMapper {
	private static final String NS = "egovframework.let.usr.service.impl.PublicTermsDAO.";

	public PublicTermsVO selectCurrentTerms(String termsTypeCode) {
		return selectOne(NS + "selectCurrentTerms", termsTypeCode);
	}
}
