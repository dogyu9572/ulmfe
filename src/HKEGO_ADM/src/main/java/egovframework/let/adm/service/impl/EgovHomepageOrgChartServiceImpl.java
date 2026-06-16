package egovframework.let.adm.service.impl;

import java.util.List;

import org.egovframe.rte.fdl.cmmn.EgovAbstractServiceImpl;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import egovframework.let.adm.service.EgovHomepageOrgChartService;
import egovframework.let.adm.service.vo.HomepageOrgChartVO;
import jakarta.annotation.Resource;

@Service("egovHomepageOrgChartService")
public class EgovHomepageOrgChartServiceImpl extends EgovAbstractServiceImpl implements EgovHomepageOrgChartService {
	@Resource(name = "homepageOrgChartDAO")
	private HomepageOrgChartDAO homepageOrgChartDAO;

	@Override
	public List<HomepageOrgChartVO> getOrgChartMembers(String frstClsfCd, String scndClsfCd) {
		if (isBlank(frstClsfCd) || isBlank(scndClsfCd)) {
			throw new IllegalArgumentException("조직도 분류를 선택해주세요.");
		}
		return homepageOrgChartDAO.selectMemberList(frstClsfCd.trim(), scndClsfCd.trim());
	}

	@Override
	@Transactional
	public HomepageOrgChartVO saveOrgChartMember(HomepageOrgChartVO member) {
		validate(member);
		member.setFrstClsfCd(member.getFrstClsfCd().trim());
		member.setFrstClsfNm(trimToEmpty(member.getFrstClsfNm()));
		member.setScndClsfCd(member.getScndClsfCd().trim());
		member.setScndClsfNm(trimToEmpty(member.getScndClsfNm()));
		member.setTaskCn(member.getTaskCn().trim());
		member.setTelno(trimToEmpty(member.getTelno()));
		if (member.getSortSeq() == null) {
			member.setSortSeq(0);
		}
		member.setUseYn("N".equalsIgnoreCase(member.getUseYn()) ? "N" : "Y");
		if (member.getOrgMbrSn() == null) {
			homepageOrgChartDAO.insertMember(member);
		} else {
			homepageOrgChartDAO.updateMember(member);
		}
		return homepageOrgChartDAO.selectMember(member.getOrgMbrSn());
	}

	@Override
	@Transactional
	public void deleteOrgChartMember(Integer orgMbrSn, String deltr) {
		if (orgMbrSn == null) {
			throw new IllegalArgumentException("삭제할 조직도 항목이 없습니다.");
		}
		homepageOrgChartDAO.deleteMember(orgMbrSn, deltr);
	}

	private void validate(HomepageOrgChartVO member) {
		if (member == null) {
			throw new IllegalArgumentException("저장할 조직도 정보가 없습니다.");
		}
		if (isBlank(member.getFrstClsfCd()) || isBlank(member.getScndClsfCd())) {
			throw new IllegalArgumentException("조직도 분류를 선택해주세요.");
		}
		if (isBlank(member.getTaskCn())) {
			throw new IllegalArgumentException("담당업무를 입력해주세요.");
		}
	}

	private boolean isBlank(String value) {
		return value == null || value.trim().isEmpty();
	}

	private String trimToEmpty(String value) {
		return value == null ? "" : value.trim();
	}
}
