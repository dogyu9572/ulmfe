package egovframework.let.usr.service;

import egovframework.let.usr.service.vo.PublicTermsVO;

public interface EgovPublicTermsService {
	PublicTermsVO getCurrentTerms(String termsTypeCode);
}
