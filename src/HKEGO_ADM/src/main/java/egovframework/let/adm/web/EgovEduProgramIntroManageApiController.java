package egovframework.let.adm.web;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import egovframework.com.cmm.ApiResponse;
import egovframework.let.adm.service.EgovEduProgramIntroService;
import egovframework.let.adm.service.vo.EduProgramIntroVO;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/** 홈페이지 교육프로그램 소개 관리 API */
@Slf4j
@RestController
@RequestMapping("/api/admin/edu-program-intros")
@RequiredArgsConstructor
public class EgovEduProgramIntroManageApiController {
	private final EgovEduProgramIntroService eduProgramIntroService;

	/**
	 * 등록자·수정자·삭제자는 요청 값이 아니라 세션에서 가져온다. CI 관리와 같은 방식이다.
	 * 요청 본문이나 쿼리로 받으면 감사 기록을 마음대로 적거나 비워 둘 수 있다.
	 */
	private String sessionAdminName(HttpSession session) {
		Object value = session == null ? null : session.getAttribute("adminName");
		return value == null ? null : value.toString();
	}

	@GetMapping
	public ApiResponse<List<EduProgramIntroVO>> getIntroList(
		@RequestParam(value = "prgrmCtgryCd", required = false) String prgrmCtgryCd,
		@RequestParam(value = "useYn", required = false) String useYn,
		@RequestParam(value = "keyword", required = false) String keyword) {
		try {
			return ApiResponse.success("교육프로그램 소개 목록을 조회했습니다.",
				eduProgramIntroService.getIntroList(prgrmCtgryCd, useYn, keyword));
		} catch (Exception e) {
			log.error("교육프로그램 소개 목록 조회 오류", e);
			return ApiResponse.error(ApiResponse.messageOf(e, "목록 조회 중 오류가 발생했습니다."));
		}
	}

	@GetMapping("/categories")
	public ApiResponse<List<Map<String, Object>>> getCategoryCodes() {
		try {
			return ApiResponse.success("프로그램 분류를 조회했습니다.", eduProgramIntroService.getCategoryCodes());
		} catch (Exception e) {
			log.error("프로그램 분류 조회 오류", e);
			return ApiResponse.error(ApiResponse.messageOf(e, "분류 조회 중 오류가 발생했습니다."));
		}
	}

	@GetMapping("/{prgrmIntrdSn}")
	public ApiResponse<EduProgramIntroVO> getIntro(@PathVariable Integer prgrmIntrdSn) {
		try {
			EduProgramIntroVO intro = eduProgramIntroService.getIntro(prgrmIntrdSn);
			return intro != null
				? ApiResponse.success("교육프로그램 소개 상세를 조회했습니다.", intro)
				: ApiResponse.error("교육프로그램 소개 정보를 찾을 수 없습니다.");
		} catch (Exception e) {
			log.error("교육프로그램 소개 상세 조회 오류", e);
			return ApiResponse.error(ApiResponse.messageOf(e, "상세 조회 중 오류가 발생했습니다."));
		}
	}

	@PostMapping
	public ApiResponse<EduProgramIntroVO> createIntro(@RequestBody EduProgramIntroVO intro, HttpSession session) {
		try {
			intro.setPrgrmIntrdSn(null);
			String actor = sessionAdminName(session);
			intro.setRgtr(actor);
			intro.setMdtr(actor);
			return ApiResponse.success("교육프로그램이 등록되었습니다.", eduProgramIntroService.saveIntro(intro));
		} catch (Exception e) {
			log.error("교육프로그램 소개 등록 오류", e);
			return ApiResponse.error(ApiResponse.messageOf(e, "등록 중 오류가 발생했습니다."));
		}
	}

	@PutMapping("/{prgrmIntrdSn}")
	public ApiResponse<EduProgramIntroVO> updateIntro(
		@PathVariable Integer prgrmIntrdSn,
		@RequestBody EduProgramIntroVO intro,
		HttpSession session) {
		try {
			intro.setPrgrmIntrdSn(prgrmIntrdSn);
			intro.setMdtr(sessionAdminName(session));
			return ApiResponse.success("교육프로그램이 수정되었습니다.", eduProgramIntroService.saveIntro(intro));
		} catch (Exception e) {
			log.error("교육프로그램 소개 수정 오류", e);
			return ApiResponse.error(ApiResponse.messageOf(e, "수정 중 오류가 발생했습니다."));
		}
	}

	@PutMapping("/{prgrmIntrdSn}/seq")
	public ApiResponse<Void> updateIntroSeq(
		@PathVariable Integer prgrmIntrdSn,
		@RequestParam Integer sortSeq,
		HttpSession session) {
		try {
			eduProgramIntroService.updateIntroSeq(prgrmIntrdSn, sortSeq, sessionAdminName(session));
			return ApiResponse.success("순서가 변경되었습니다.", null);
		} catch (Exception e) {
			log.error("교육프로그램 소개 순서 변경 오류", e);
			return ApiResponse.error(ApiResponse.messageOf(e, "순서 변경 중 오류가 발생했습니다."));
		}
	}

	@DeleteMapping("/{prgrmIntrdSn}")
	public ApiResponse<Void> deleteIntro(@PathVariable Integer prgrmIntrdSn, HttpSession session) {
		try {
			eduProgramIntroService.deleteIntro(prgrmIntrdSn, sessionAdminName(session));
			return ApiResponse.success("교육프로그램이 삭제되었습니다.", null);
		} catch (Exception e) {
			log.error("교육프로그램 소개 삭제 오류", e);
			return ApiResponse.error(ApiResponse.messageOf(e, "삭제 중 오류가 발생했습니다."));
		}
	}
}
