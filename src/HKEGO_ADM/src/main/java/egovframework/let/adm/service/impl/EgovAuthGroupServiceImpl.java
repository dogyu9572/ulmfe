package egovframework.let.adm.service.impl;

import jakarta.annotation.Resource;
import egovframework.let.adm.service.vo.AuthGroupDto;
import egovframework.let.adm.service.vo.PageListResult;
import egovframework.let.adm.service.vo.AuthGroupVO;
import egovframework.let.adm.service.vo.AuthInfoVO;
import egovframework.let.adm.service.vo.CodeDtVO;
import egovframework.let.adm.service.EgovCodeService;
import egovframework.let.adm.service.impl.AuthDAO;
import org.egovframe.rte.fdl.cmmn.EgovAbstractServiceImpl;

import egovframework.let.adm.service.EgovAuthGroupService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service("egovAuthGroupService")
public class EgovAuthGroupServiceImpl extends EgovAbstractServiceImpl implements EgovAuthGroupService {
	@Resource(name = "authDAO")
	private AuthDAO authDAO;
	@Resource(name = "egovCodeService")
	private EgovCodeService codeService;

	public Map<String, Object> getAuthGroupListPage(String useYn, int page, int size) {
		int safePage = Math.max(1, page);
		int safeSize = Math.min(Math.max(1, size), 100);
		int offset = (safePage - 1) * safeSize;
		int totalCount = authDAO.countAuthGroupList(useYn);
		List<AuthGroupVO> list = authDAO.selectAuthGroupList(useYn, offset, safeSize);
		List<AuthGroupDto> dtos = list.stream().map(this::toDto).collect(Collectors.toList());
		return PageListResult.of(dtos, totalCount, safePage, safeSize);
	}

	public AuthGroupDto getAuthGroup(String authrtCd) {
		AuthGroupVO g = authDAO.selectAuthGroup(authrtCd);
		return g != null ? toDto(g) : null;
	}

	@Transactional
	public void createAuthGroup(AuthGroupDto dto) {
		AuthGroupVO g = AuthGroupVO.builder()
			.authrtCd(dto.getAuthrtCd())
			.authrtNm(dto.getAuthrtNm())
			.authrtCn(dto.getAuthrtCn())
			.useYn(dto.getUseYn() != null ? dto.getUseYn() : "Y")
			.build();
		authDAO.insertAuthGroup(g);
	}

	@Transactional
	public void updateAuthGroup(AuthGroupDto dto) {
		AuthGroupVO g = AuthGroupVO.builder()
			.authrtCd(dto.getAuthrtCd())
			.authrtNm(dto.getAuthrtNm())
			.authrtCn(dto.getAuthrtCn())
			.useYn(dto.getUseYn())
			.build();
		authDAO.updateAuthGroup(g);
	}

	@Transactional
	public void deleteAuthGroup(String authrtCd) {
		int cnt = authDAO.countUsersByAuthGroup(authrtCd);
		if (cnt > 0) {
			throw new RuntimeException("해당 권한 그룹을 사용하는 관리자가 있어 삭제할 수 없습니다.");
		}
		authDAO.deleteAllAuthInfo(authrtCd);
		authDAO.deleteAuthGroup(authrtCd);
	}

	public List<String> getAuthMenuCodes(String authrtCd) {
		List<AuthInfoVO> list = authDAO.selectAuthInfoList(authrtCd);
		return list.stream()
			.map(AuthInfoVO::getMenuCd)
			.filter(c -> c != null && !c.isEmpty())
			.collect(Collectors.toList());
	}

	public List<String> getAuthorizedMenuPaths(String authrtCd) {
		List<String> menuCodes = getAuthMenuCodes(authrtCd);
		if (menuCodes.isEmpty()) {
			return List.of();
		}
		Set<String> menuCodeSet = Set.copyOf(menuCodes);
		return codeService.getCodeDtList("COM002", "Y").stream()
			.filter(code -> code.getCdDtlId() != null && menuCodeSet.contains(code.getCdDtlId()))
			.map(CodeDtVO::getCdDtlCn)
			.filter(path -> path != null && !path.isBlank())
			.distinct()
			.collect(Collectors.toList());
	}

	@Transactional
	public void setAuthMenus(String authrtCd, List<String> menuCodes, String rgtr) {
		authDAO.deleteAllAuthInfo(authrtCd);
		if (menuCodes != null && !menuCodes.isEmpty()) {
			for (String menuCode : menuCodes) {
				AuthInfoVO info = AuthInfoVO.builder()
					.authrtCd(authrtCd)
					.menuCd(menuCode)
					.rgtr(rgtr)
					.build();
				authDAO.insertAuthInfo(info);
			}
		}
	}

	private AuthGroupDto toDto(AuthGroupVO g) {
		return AuthGroupDto.builder()
			.authrtCd(g.getAuthrtCd())
			.authrtNm(g.getAuthrtNm())
			.authrtCn(g.getAuthrtCn())
			.useYn(g.getUseYn())
			.build();
	}
}
