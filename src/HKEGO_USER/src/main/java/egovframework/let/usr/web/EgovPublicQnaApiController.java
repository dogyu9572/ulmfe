package egovframework.let.usr.web;

import java.util.Objects;

import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import egovframework.com.cmm.ApiResponse;
import egovframework.let.usr.service.EgovPublicQnaService;
import egovframework.let.usr.service.dto.QnaDetailResponse;
import egovframework.let.usr.service.dto.QnaListItemResponse;
import egovframework.let.usr.service.dto.QnaPasswordRequest;
import egovframework.let.usr.service.dto.QnaPostRequest;
import egovframework.let.usr.service.dto.QnaUpdateRequest;
import egovframework.let.usr.service.dto.QnaVerifyResponse;
import egovframework.let.usr.service.vo.PublicPageResult;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/user/qna")
@RequiredArgsConstructor
public class EgovPublicQnaApiController {
	private static final MediaType SVG_MEDIA_TYPE = MediaType.parseMediaType("image/svg+xml");

	private final EgovPublicQnaService publicQnaService;

	@GetMapping
	public ApiResponse<PublicPageResult<QnaListItemResponse>> getPosts(
		@RequestParam(defaultValue = "1") int page,
		@RequestParam(defaultValue = "10") int size,
		@RequestParam(defaultValue = "all") String searchType,
		@RequestParam(required = false) String keyword
	) {
		return ApiResponse.success(
			"1:1문의 목록을 조회했습니다.",
			publicQnaService.getPosts(page, size, searchType, keyword)
		);
	}

	@GetMapping("/captcha")
	public ResponseEntity<String> captcha(HttpServletRequest request) {
		HttpSession session = request.getSession(true);
		return ResponseEntity.ok()
			.contentType(SVG_MEDIA_TYPE)
			.cacheControl(CacheControl.noStore())
			.header(HttpHeaders.PRAGMA, "no-cache")
			.body(publicQnaService.issueCaptcha(session));
	}

	@PostMapping("/{postId}/verify")
	public ApiResponse<QnaVerifyResponse> verifyPassword(
		@PathVariable String postId,
		@Valid @RequestBody QnaPasswordRequest body,
		HttpServletRequest request
	) {
		return ApiResponse.success(
			"비밀번호가 확인되었습니다.",
			publicQnaService.verifyPassword(postId, body.getPassword(), request.getSession(true))
		);
	}

	@GetMapping("/{postId}")
	public ApiResponse<QnaDetailResponse> getPost(
		@PathVariable String postId,
		@RequestParam(defaultValue = "true") boolean increaseViewCount,
		HttpServletRequest request
	) {
		return ApiResponse.success(
			"1:1문의 상세를 조회했습니다.",
			publicQnaService.getPost(postId, request.getSession(true), increaseViewCount)
		);
	}

	@PostMapping
	public ResponseEntity<ApiResponse<QnaDetailResponse>> createPost(
		@Valid @RequestBody QnaPostRequest body,
		HttpServletRequest request
	) {
		QnaDetailResponse created = publicQnaService.createPost(body, request.getSession(true));
		return ResponseEntity.status(HttpStatus.CREATED)
			.body(ApiResponse.success("1:1문의가 등록되었습니다.", created));
	}

	@PutMapping("/{postId}")
	public ApiResponse<QnaDetailResponse> updatePost(
		@PathVariable String postId,
		@Valid @RequestBody QnaUpdateRequest body,
		HttpServletRequest request
	) {
		return ApiResponse.success(
			"1:1문의가 수정되었습니다.",
			publicQnaService.updatePost(postId, body, request.getSession(true))
		);
	}

	@DeleteMapping("/{postId}")
	public ApiResponse<Void> deletePost(
		@PathVariable String postId,
		HttpServletRequest request
	) {
		publicQnaService.deletePost(postId, request.getSession(true));
		return ApiResponse.success("1:1문의가 삭제되었습니다.", null);
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ApiResponse<Void>> validationError(MethodArgumentNotValidException exception) {
		String message = exception.getBindingResult().getAllErrors().stream()
			.findFirst()
			.map(error -> error instanceof FieldError fieldError
				? fieldError.getDefaultMessage()
				: error.getDefaultMessage())
			.filter(Objects::nonNull)
			.orElse("입력값을 확인해주세요.");
		return ResponseEntity.badRequest().body(ApiResponse.error(message));
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<ApiResponse<Void>> badRequest(IllegalArgumentException exception) {
		return ResponseEntity.badRequest().body(ApiResponse.error(exception.getMessage()));
	}

	@ExceptionHandler(SecurityException.class)
	public ResponseEntity<ApiResponse<Void>> forbidden(SecurityException exception) {
		return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error(exception.getMessage()));
	}

	@ExceptionHandler(IllegalStateException.class)
	public ResponseEntity<ApiResponse<Void>> serverError(IllegalStateException exception) {
		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.error(exception.getMessage()));
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<ApiResponse<Void>> unexpectedError(Exception exception) {
		log.error("1:1문의 공개 API 처리 중 오류가 발생했습니다.", exception);
		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
			.body(ApiResponse.error("요청 처리 중 오류가 발생했습니다."));
	}
}
