package egovframework.let.adm.service;

import java.util.List;

import egovframework.let.adm.service.vo.BbsPostVO;

public interface EgovBbsPostService {
	List<BbsPostVO> getBbsPostListForAdmin(String bbsId, int page, int size);
	int getBbsPostCountForAdmin(String bbsId);
	List<BbsPostVO> getBbsPostListForAdmin(
		String bbsId, int page, int size, String searchType, String searchKeyword,
		String category, String startDate, String endDate
	);
	int getBbsPostCountForAdmin(
		String bbsId, String searchType, String searchKeyword, String category, String startDate, String endDate
	);
	BbsPostVO getBbsPostById(String bbsId, String postId);
	BbsPostVO createBbsPost(BbsPostVO bbsPost);
	BbsPostVO updateBbsPost(BbsPostVO bbsPost);
	void deleteBbsPost(String bbsId, String postId);
	void incrementViewCount(String bbsId, String postId);
}
