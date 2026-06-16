package egovframework.let.adm.service;

import java.util.List;

import egovframework.let.adm.service.vo.HomepageOrgChartVO;

public interface EgovHomepageOrgChartService {
	List<HomepageOrgChartVO> getOrgChartMembers(String frstClsfCd, String scndClsfCd);
	HomepageOrgChartVO saveOrgChartMember(HomepageOrgChartVO member);
	void deleteOrgChartMember(Integer orgMbrSn, String deltr);
}
