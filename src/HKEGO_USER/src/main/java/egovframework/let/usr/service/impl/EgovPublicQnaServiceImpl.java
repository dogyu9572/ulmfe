package egovframework.let.usr.service.impl;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.Set;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import egovframework.let.usr.service.EgovPublicQnaService;
import egovframework.let.usr.service.dto.QnaDetailResponse;
import egovframework.let.usr.service.dto.QnaListItemResponse;
import egovframework.let.usr.service.dto.QnaPostRequest;
import egovframework.let.usr.service.dto.QnaUpdateRequest;
import egovframework.let.usr.service.dto.QnaVerifyResponse;
import egovframework.let.usr.service.vo.PublicPageResult;
import egovframework.let.usr.service.vo.QnaPostVO;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

@Service("egovPublicQnaService")
@RequiredArgsConstructor
public class EgovPublicQnaServiceImpl implements EgovPublicQnaService {
	private static final String ACCESS_SESSION_PREFIX = "PUBLIC_QNA_ACCESS_";
	private static final String CAPTCHA_SESSION_KEY = "PUBLIC_QNA_CAPTCHA";
	private static final String POST_ID_CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	private static final String CAPTCHA_CHARACTERS = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
	private static final Set<String> SEARCH_TYPES = Set.of("all", "title", "content", "writer");
	private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ISO_LOCAL_DATE;
	private static final SecureRandom RANDOM = new SecureRandom();

	private final PublicQnaDAO publicQnaDAO;
	private final PasswordEncoder passwordEncoder;

	@Override
	@Transactional(readOnly = true)
	public PublicPageResult<QnaListItemResponse> getPosts(
		int page,
		int size,
		String searchType,
		String keyword
	) {
		int safePage = Math.max(1, page);
		int safeSize = Math.min(100, Math.max(1, size));
		String safeSearchType = normalizeSearchType(searchType);
		String safeKeyword = trimToNull(keyword);
		int totalCount = publicQnaDAO.countPosts(safeSearchType, safeKeyword);
		List<QnaListItemResponse> posts = publicQnaDAO.selectPosts(
				safeSearchType,
				safeKeyword,
				(safePage - 1) * safeSize,
				safeSize
			).stream()
			.map(this::toListItem)
			.toList();
		return PublicPageResult.of(posts, totalCount, safePage, safeSize);
	}

	@Override
	@Transactional(readOnly = true)
	public QnaVerifyResponse verifyPassword(String postId, String password, HttpSession session) {
		QnaPostVO post = requirePost(postId);
		boolean passwordProtected = isPasswordProtected(post);
		if (passwordProtected) {
			boolean matched;
			try {
				matched = password != null && passwordEncoder.matches(password, post.getPasswordHash());
			} catch (IllegalArgumentException ex) {
				matched = false;
			}
			if (!matched) {
				throw new SecurityException("비밀번호가 일치하지 않습니다.");
			}
			grantAccess(session, post.getPostId());
		}
		return QnaVerifyResponse.builder()
			.postId(post.getPostId())
			.verified(true)
			.passwordProtected(passwordProtected)
			.build();
	}

	@Override
	@Transactional
	public QnaDetailResponse getPost(String postId, HttpSession session, boolean increaseViewCount) {
		QnaPostVO post = requirePost(postId);
		if (isPasswordProtected(post) && !hasAccess(session, post.getPostId())) {
			throw new SecurityException("비밀번호 확인이 필요합니다.");
		}
		if (increaseViewCount) {
			publicQnaDAO.increaseViewCount(post.getPostId());
			post.setViewCount((post.getViewCount() == null ? 0 : post.getViewCount()) + 1);
		}
		return toDetail(post);
	}

	@Override
	@Transactional
	public QnaDetailResponse createPost(QnaPostRequest request, HttpSession session) {
		validateCaptcha(request.getCaptcha(), session);
		validatePasswordPolicy(request.getPassword());
		QnaPostVO post = new QnaPostVO();
		post.setPostId(generatePostId());
		post.setTitle(request.getTitle().trim());
		post.setContent(request.getContent().trim());
		post.setWriterName(request.getWriterName().trim());
		post.setLockYn("Y");
		post.setPasswordHash(passwordEncoder.encode(request.getPassword()));
		post.setPublishedDate(LocalDate.now().format(DATE_FORMAT));
		post.setAnswerStatus("WAIT");
		if (publicQnaDAO.insertPost(post) <= 0) {
			throw new IllegalStateException("문의 등록에 실패했습니다.");
		}
		grantAccess(session, post.getPostId());
		return toDetail(requirePost(post.getPostId()));
	}

	@Override
	@Transactional
	public QnaDetailResponse updatePost(String postId, QnaUpdateRequest request, HttpSession session) {
		QnaPostVO post = requirePost(postId);
		requireMutationAccess(post, session);
		validateCaptcha(request.getCaptcha(), session);
		validatePasswordPolicy(request.getPassword());
		post.setTitle(request.getTitle().trim());
		post.setContent(request.getContent().trim());
		post.setLockYn("Y");
		post.setPasswordHash(passwordEncoder.encode(request.getPassword()));
		if (publicQnaDAO.updatePost(post) <= 0) {
			throw new IllegalStateException("문의 수정에 실패했습니다.");
		}
		return toDetail(requirePost(post.getPostId()));
	}

	@Override
	@Transactional
	public void deletePost(String postId, HttpSession session) {
		QnaPostVO post = requirePost(postId);
		requireMutationAccess(post, session);
		if (publicQnaDAO.deletePost(post.getPostId()) <= 0) {
			throw new IllegalStateException("문의 삭제에 실패했습니다.");
		}
		session.removeAttribute(accessSessionKey(post.getPostId()));
	}

	@Override
	public String issueCaptcha(HttpSession session) {
		StringBuilder code = new StringBuilder(6);
		for (int i = 0; i < 6; i++) {
			code.append(CAPTCHA_CHARACTERS.charAt(RANDOM.nextInt(CAPTCHA_CHARACTERS.length())));
		}
		session.setAttribute(CAPTCHA_SESSION_KEY, code.toString());
		return buildCaptchaSvg(code.toString());
	}

	private QnaPostVO requirePost(String postId) {
		String safePostId = trimToNull(postId);
		if (safePostId == null || !safePostId.matches("[A-Za-z0-9_-]{1,20}")) {
			throw new IllegalArgumentException("올바른 게시글 식별자가 필요합니다.");
		}
		QnaPostVO post = publicQnaDAO.selectPost(safePostId);
		if (post == null) {
			throw new IllegalArgumentException("문의를 찾을 수 없습니다.");
		}
		return post;
	}

	private void requireMutationAccess(QnaPostVO post, HttpSession session) {
		if (!isPasswordProtected(post)) {
			throw new SecurityException("기존 공개 문의는 사용자 화면에서 수정하거나 삭제할 수 없습니다.");
		}
		if (!hasAccess(session, post.getPostId())) {
			throw new SecurityException("비밀번호 확인이 필요합니다.");
		}
	}

	private boolean isPasswordProtected(QnaPostVO post) {
		return "Y".equalsIgnoreCase(post.getLockYn()) && trimToNull(post.getPasswordHash()) != null;
	}

	private void validateCaptcha(String enteredCode, HttpSession session) {
		Object savedCode = session.getAttribute(CAPTCHA_SESSION_KEY);
		session.removeAttribute(CAPTCHA_SESSION_KEY);
		if (!(savedCode instanceof String code)
			|| enteredCode == null
			|| !code.equalsIgnoreCase(enteredCode.trim())) {
			throw new IllegalArgumentException("자동등록방지 코드가 일치하지 않습니다.");
		}
	}

	private void validatePasswordPolicy(String password) {
		if (password == null || password.length() < 10 || password.length() > 50) {
			throw new IllegalArgumentException("비밀번호는 10자 이상 50자 이하로 입력해주세요.");
		}
		if (!password.matches("[A-Za-z0-9!@#$%^&*]+")) {
			throw new IllegalArgumentException("비밀번호에는 영문, 숫자와 ! @ # $ % ^ & * 만 사용할 수 있습니다.");
		}
		int characterGroups = 0;
		if (password.matches(".*[A-Za-z].*")) characterGroups++;
		if (password.matches(".*[0-9].*")) characterGroups++;
		if (password.matches(".*[!@#$%^&*].*")) characterGroups++;
		if (characterGroups < 2) {
			throw new IllegalArgumentException("비밀번호는 영문, 숫자, 특수문자 중 2종류 이상을 조합해주세요.");
		}
	}

	private String generatePostId() {
		String postId;
		do {
			StringBuilder value = new StringBuilder(10);
			for (int i = 0; i < 10; i++) {
				value.append(POST_ID_CHARACTERS.charAt(RANDOM.nextInt(POST_ID_CHARACTERS.length())));
			}
			postId = value.toString();
		} while (publicQnaDAO.existsPostId(postId));
		return postId;
	}

	private QnaListItemResponse toListItem(QnaPostVO post) {
		return QnaListItemResponse.builder()
			.postId(post.getPostId())
			.title(post.getTitle())
			.writerNameMasked(maskWriterName(post.getWriterName()))
			.registeredAt(post.getRegisteredAt())
			.publishedDate(post.getPublishedDate())
			.answerStatus(normalizeAnswerStatus(post.getAnswerStatus()))
			.passwordProtected(isPasswordProtected(post))
			.build();
	}

	private QnaDetailResponse toDetail(QnaPostVO post) {
		return QnaDetailResponse.builder()
			.postId(post.getPostId())
			.title(post.getTitle())
			.content(post.getContent())
			.writerName(post.getWriterName())
			.registeredAt(post.getRegisteredAt())
			.modifiedAt(post.getModifiedAt())
			.publishedDate(post.getPublishedDate())
			.viewCount(post.getViewCount() == null ? 0 : post.getViewCount())
			.answerStatus(normalizeAnswerStatus(post.getAnswerStatus()))
			.answerContent(post.getAnswerContent())
			.answererName(post.getAnswererName())
			.answerDate(post.getAnswerDate())
			.answeredAt(post.getAnsweredAt())
			.passwordProtected(isPasswordProtected(post))
			.build();
	}

	private String normalizeAnswerStatus(String status) {
		return "DONE".equalsIgnoreCase(status) ? "DONE" : "WAIT";
	}

	private String maskWriterName(String name) {
		String safeName = trimToNull(name);
		if (safeName == null) return "";
		int[] characters = safeName.codePoints().toArray();
		if (characters.length == 1) return "*";
		if (characters.length == 2) return new String(characters, 0, 1) + "*";
		int maskedLength = Math.min(characters.length, 7);
		return new String(characters, 0, 1) + "*".repeat(maskedLength - 2)
			+ new String(characters, characters.length - 1, 1);
	}

	private String normalizeSearchType(String searchType) {
		String normalized = searchType == null ? "all" : searchType.trim().toLowerCase(Locale.ROOT);
		return SEARCH_TYPES.contains(normalized) ? normalized : "all";
	}

	private void grantAccess(HttpSession session, String postId) {
		session.setAttribute(accessSessionKey(postId), Boolean.TRUE);
	}

	private boolean hasAccess(HttpSession session, String postId) {
		return Boolean.TRUE.equals(session.getAttribute(accessSessionKey(postId)));
	}

	private String accessSessionKey(String postId) {
		return ACCESS_SESSION_PREFIX + postId;
	}

	private String trimToNull(String value) {
		if (value == null || value.isBlank()) return null;
		return value.trim();
	}

	private String buildCaptchaSvg(String code) {
		StringBuilder noise = new StringBuilder();
		for (int i = 0; i < 8; i++) {
			int x1 = RANDOM.nextInt(150);
			int y1 = RANDOM.nextInt(60);
			int x2 = RANDOM.nextInt(150);
			int y2 = RANDOM.nextInt(60);
			noise.append("<line x1=\"").append(x1).append("\" y1=\"").append(y1)
				.append("\" x2=\"").append(x2).append("\" y2=\"").append(y2)
				.append("\" stroke=\"#b8c8d8\" stroke-width=\"1\"/>");
		}
		StringBuilder letters = new StringBuilder();
		for (int i = 0; i < code.length(); i++) {
			int rotation = RANDOM.nextInt(25) - 12;
			int x = 12 + i * 23;
			letters.append("<text x=\"").append(x).append("\" y=\"40\" transform=\"rotate(")
				.append(rotation).append(' ').append(x).append(" 40)\">")
				.append(code.charAt(i)).append("</text>");
		}
		return "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"150\" height=\"60\" viewBox=\"0 0 150 60\">"
			+ "<rect width=\"150\" height=\"60\" rx=\"6\" fill=\"#eef5f9\"/>"
			+ noise
			+ "<g fill=\"#153047\" font-family=\"Arial,sans-serif\" font-size=\"25\" font-weight=\"700\">"
			+ letters
			+ "</g></svg>";
	}
}
