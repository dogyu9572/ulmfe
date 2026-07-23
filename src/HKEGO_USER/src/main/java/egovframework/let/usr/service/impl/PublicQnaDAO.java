package egovframework.let.usr.service.impl;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.springframework.stereotype.Repository;

import egovframework.let.usr.service.vo.QnaPostVO;

@Repository("publicQnaDAO")
public class PublicQnaDAO extends EgovAbstractMapper {
	private static final String NS = "egovframework.let.usr.service.impl.PublicQnaDAO.";

	public List<QnaPostVO> selectPosts(String searchType, String keyword, int offset, int size) {
		Map<String, Object> params = searchParams(searchType, keyword);
		params.put("offset", offset);
		params.put("size", size);
		return selectList(NS + "selectPosts", params);
	}

	public int countPosts(String searchType, String keyword) {
		Integer count = selectOne(NS + "countPosts", searchParams(searchType, keyword));
		return count == null ? 0 : count;
	}

	public QnaPostVO selectPost(String postId) {
		return selectOne(NS + "selectPost", postId);
	}

	public int insertPost(QnaPostVO post) {
		return insert(NS + "insertPost", post);
	}

	public int updatePost(QnaPostVO post) {
		return update(NS + "updatePost", post);
	}

	public int deletePost(String postId) {
		return delete(NS + "deletePost", postId);
	}

	public int increaseViewCount(String postId) {
		return update(NS + "increaseViewCount", postId);
	}

	public boolean existsPostId(String postId) {
		Integer count = selectOne(NS + "countPostId", postId);
		return count != null && count > 0;
	}

	private Map<String, Object> searchParams(String searchType, String keyword) {
		Map<String, Object> params = new HashMap<>();
		params.put("searchType", searchType);
		params.put("keyword", keyword);
		return params;
	}
}
