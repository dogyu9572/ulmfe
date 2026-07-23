package egovframework.let.usr.service.impl;

import java.util.List;
import java.util.Locale;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import egovframework.let.usr.service.EgovPublicBoardService;
import egovframework.let.usr.service.EgovPublicFileService;
import egovframework.let.usr.service.vo.PublicBoardPostVO;
import egovframework.let.usr.service.vo.PublicBoardCategoryVO;
import egovframework.let.usr.service.vo.PublicPageResult;
import lombok.RequiredArgsConstructor;

@Service("egovPublicBoardService")
@RequiredArgsConstructor
public class EgovPublicBoardServiceImpl implements EgovPublicBoardService {
	private static final Set<String> PUBLIC_BOARD_IDS = Set.of("ZEHSB", "EXHBT", "EVENT", "FAQ01", "GALRY", "LRNSUP");
	private static final Set<String> SEARCH_TYPES = Set.of("all", "title", "content");
	private static final Set<String> LEARNING_SUPPORT_PROGRAM_TYPES = Set.of("EXPLORE", "MISSION");

	private final PublicBoardDAO publicBoardDAO;
	private final EgovPublicFileService publicFileService;

	@Override
	@Transactional(readOnly = true)
	public PublicPageResult<PublicBoardPostVO> getPosts(
		String boardId,
		int page,
		int size,
		String searchType,
		String keyword,
		String category,
		String programType
	) {
		String safeBoardId = requirePublicBoard(boardId);
		int safePage = Math.max(1, page);
		int safeSize = Math.min(100, Math.max(1, size));
		String safeSearchType = normalizeSearchType(searchType);
		String safeKeyword = trimToNull(keyword);
		String safeCategory = trimToNull(category);
		String safeProgramType = normalizeProgramType(safeBoardId, programType);
		int totalCount = publicBoardDAO.countPosts(safeBoardId, safeSearchType, safeKeyword, safeCategory, safeProgramType);
		List<PublicBoardPostVO> posts = publicBoardDAO.selectPosts(
				safeBoardId,
				safeSearchType,
				safeKeyword,
				safeCategory,
				safeProgramType,
				(safePage - 1) * safeSize,
				safeSize
			);
		posts.forEach(post -> post.setAttachments(List.of()));
		return PublicPageResult.of(
			posts,
			totalCount,
			safePage,
			safeSize
		);
	}

	@Override
	@Transactional
	public PublicBoardPostVO getPost(String boardId, String postId, boolean increaseViewCount) {
		String safeBoardId = requirePublicBoard(boardId);
		String safePostId = trimToNull(postId);
		if (safePostId == null) throw new IllegalArgumentException("게시글 식별자가 필요합니다.");
		PublicBoardPostVO post = publicBoardDAO.selectPost(safeBoardId, safePostId);
		if (post == null) throw new IllegalArgumentException("게시글을 찾을 수 없습니다.");
		PublicBoardPostVO navigation = publicBoardDAO.selectPostNavigation(safeBoardId, safePostId);
		if (navigation != null) {
			post.setPreviousPostId(navigation.getPreviousPostId());
			post.setPreviousPostTitle(navigation.getPreviousPostTitle());
			post.setNextPostId(navigation.getNextPostId());
			post.setNextPostTitle(navigation.getNextPostTitle());
		}
		if (increaseViewCount) {
			publicBoardDAO.increaseViewCount(safeBoardId, safePostId);
			post.setViewCount((post.getViewCount() == null ? 0 : post.getViewCount()) + 1);
		}
		post.setAttachments(publicFileService.getFiles(post.getAttachmentFileId()));
		return post;
	}

	@Override
	@Transactional(readOnly = true)
	public List<PublicBoardCategoryVO> getCategories(String boardId) {
		return publicBoardDAO.selectCategories(requirePublicBoard(boardId));
	}

	private String requirePublicBoard(String boardId) {
		String normalized = boardId == null ? "" : boardId.trim().toUpperCase(Locale.ROOT);
		if (!PUBLIC_BOARD_IDS.contains(normalized)) {
			throw new IllegalArgumentException("공개되지 않은 게시판입니다.");
		}
		return normalized;
	}

	private String normalizeSearchType(String searchType) {
		String normalized = searchType == null ? "all" : searchType.trim().toLowerCase(Locale.ROOT);
		return SEARCH_TYPES.contains(normalized) ? normalized : "all";
	}

	private String normalizeProgramType(String boardId, String programType) {
		if (!"LRNSUP".equals(boardId)) return null;
		String normalized = programType == null ? "" : programType.trim().toUpperCase(Locale.ROOT);
		if (!LEARNING_SUPPORT_PROGRAM_TYPES.contains(normalized)) {
			throw new IllegalArgumentException("학습지원 자료의 프로그램 구분이 필요합니다.");
		}
		return normalized;
	}

	private String trimToNull(String value) {
		if (value == null || value.isBlank()) return null;
		return value.trim();
	}
}
