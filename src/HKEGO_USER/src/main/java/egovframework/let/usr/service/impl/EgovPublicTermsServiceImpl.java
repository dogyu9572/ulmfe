package egovframework.let.usr.service.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import egovframework.let.usr.service.EgovPublicTermsService;
import egovframework.let.usr.service.vo.PublicTermsVO;
import lombok.RequiredArgsConstructor;

@Service("egovPublicTermsService")
@RequiredArgsConstructor
public class EgovPublicTermsServiceImpl implements EgovPublicTermsService {
	private final PublicTermsDAO publicTermsDAO;

	@Override
	@Transactional(readOnly = true)
	public PublicTermsVO getCurrentTerms(String termsTypeCode) {
		return publicTermsDAO.selectCurrentTerms(termsTypeCode);
	}
}
