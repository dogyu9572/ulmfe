package egovframework.let.adm.service;

import java.util.List;

import egovframework.let.adm.service.vo.HomepageCiVO;

public interface EgovHomepageCiService {
	List<HomepageCiVO> getCiList(String ciSeCd);
	HomepageCiVO getCi(Integer ciSn);
	HomepageCiVO saveCi(HomepageCiVO ci);
	void deleteCi(Integer ciSn, String deltr);
	void updateCiSeq(Integer ciSn, Integer sortSeq, String mdtr);
}
