package egovframework.let.usr.service;

import egovframework.let.usr.service.dto.QnaDetailResponse;
import egovframework.let.usr.service.dto.QnaListItemResponse;
import egovframework.let.usr.service.dto.QnaPostRequest;
import egovframework.let.usr.service.dto.QnaUpdateRequest;
import egovframework.let.usr.service.dto.QnaVerifyResponse;
import egovframework.let.usr.service.vo.PublicPageResult;
import jakarta.servlet.http.HttpSession;

public interface EgovPublicQnaService {
	PublicPageResult<QnaListItemResponse> getPosts(int page, int size, String searchType, String keyword);

	QnaVerifyResponse verifyPassword(String postId, String password, HttpSession session);

	QnaDetailResponse getPost(String postId, HttpSession session, boolean increaseViewCount);

	QnaDetailResponse createPost(QnaPostRequest request, HttpSession session);

	QnaDetailResponse updatePost(String postId, QnaUpdateRequest request, HttpSession session);

	void deletePost(String postId, HttpSession session);

	String issueCaptcha(HttpSession session);
}
