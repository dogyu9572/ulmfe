package egovframework.let.usr.service.impl;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.springframework.stereotype.Repository;

import egovframework.let.usr.service.vo.PublicBoardPostVO;
import egovframework.let.usr.service.vo.PublicBoardCategoryVO;

@Repository("publicBoardDAO")
public class PublicBoardDAO extends EgovAbstractMapper {
	private static final String NS = "egovframework.let.usr.service.impl.PublicBoardDAO.";

	public List<PublicBoardPostVO> selectPosts(
		String boardId,
		String searchType,
		String keyword,
		String category,
		String programType,
		int offset,
		int size
	) {
		Map<String, Object> params = searchParams(boardId, searchType, keyword, category, programType);
		params.put("offset", offset);
		params.put("size", size);
		return selectList(NS + "selectPosts", params);
	}

	public int countPosts(String boardId, String searchType, String keyword, String category, String programType) {
		Integer count = selectOne(NS + "countPosts", searchParams(boardId, searchType, keyword, category, programType));
		return count == null ? 0 : count;
	}

	public List<PublicBoardCategoryVO> selectCategories(String boardId) {
		return selectList(NS + "selectCategories", boardId);
	}

	public PublicBoardPostVO selectPost(String boardId, String postId) {
		Map<String, Object> params = new HashMap<>();
		params.put("boardId", boardId);
		params.put("postId", postId);
		return selectOne(NS + "selectPost", params);
	}

	public PublicBoardPostVO selectPostNavigation(String boardId, String postId) {
		Map<String, Object> params = new HashMap<>();
		params.put("boardId", boardId);
		params.put("postId", postId);
		return selectOne(NS + "selectPostNavigation", params);
	}

	public int increaseViewCount(String boardId, String postId) {
		Map<String, Object> params = new HashMap<>();
		params.put("boardId", boardId);
		params.put("postId", postId);
		return update(NS + "increaseViewCount", params);
	}

	private Map<String, Object> searchParams(
		String boardId,
		String searchType,
		String keyword,
		String category,
		String programType
	) {
		Map<String, Object> params = new HashMap<>();
		params.put("boardId", boardId);
		params.put("searchType", searchType);
		params.put("keyword", keyword);
		params.put("category", category);
		params.put("programType", programType);
		return params;
	}
}
