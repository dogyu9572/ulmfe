package egovframework.let.usr.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import egovframework.let.usr.service.EgovPublicEduProgramService;
import egovframework.let.usr.service.vo.PublicEduProgramVO;
import lombok.RequiredArgsConstructor;

@Service("egovPublicEduProgramService")
@RequiredArgsConstructor
public class EgovPublicEduProgramServiceImpl implements EgovPublicEduProgramService {
	private final PublicEduProgramDAO publicEduProgramDAO;

	@Override
	@Transactional(readOnly = true)
	public List<PublicEduProgramVO> getVisiblePrograms() {
		return publicEduProgramDAO.selectVisiblePrograms();
	}

	@Override
	@Transactional(readOnly = true)
	public List<PublicEduProgramVO> getCategories() {
		return publicEduProgramDAO.selectCategories();
	}
}
