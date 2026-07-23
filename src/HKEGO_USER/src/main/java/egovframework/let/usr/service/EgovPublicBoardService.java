package egovframework.let.usr.service;

import java.util.List;

import egovframework.let.usr.service.vo.PublicBoardCategoryVO;
import egovframework.let.usr.service.vo.PublicBoardPostVO;
import egovframework.let.usr.service.vo.PublicPageResult;

public interface EgovPublicBoardService {
	PublicPageResult<PublicBoardPostVO> getPosts(
		String boardId,
		int page,
		int size,
		String searchType,
		String keyword,
		String category,
		String programType
	);

	PublicBoardPostVO getPost(String boardId, String postId, boolean increaseViewCount);

	List<PublicBoardCategoryVO> getCategories(String boardId);
}
