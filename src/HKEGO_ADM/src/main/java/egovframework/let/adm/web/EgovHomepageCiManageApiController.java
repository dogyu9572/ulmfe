package egovframework.let.adm.web;

import java.util.List;

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
import egovframework.let.adm.service.EgovHomepageCiService;
import egovframework.let.adm.service.vo.HomepageCiVO;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/admin/ci")
@RequiredArgsConstructor
public class EgovHomepageCiManageApiController {
	private final EgovHomepageCiService homepageCiService;

	/**
	 * 등록자·수정자·삭제자는 요청 값이 아니라 세션에서 가져온다. 게시글 관리와 같은 방식이다.
	 * 요청 본문이나 쿼리로 받으면 감사 기록을 마음대로 적거나 비워 둘 수 있다.
	 */
	private String sessionAdminName(HttpSession session) {
		Object value = session == null ? null : session.getAttribute("adminName");
		return value == null ? null : value.toString();
	}

	@GetMapping
	public ApiResponse<List<HomepageCiVO>> getCiList(@RequestParam("ciSeCd") String ciSeCd) {
		try {
			return ApiResponse.success("CI 목록을 조회했습니다.", homepageCiService.getCiList(ciSeCd));
		} catch (Exception e) {
			log.error("CI 목록 조회 오류", e);
			return ApiResponse.error(ApiResponse.messageOf(e, "CI 목록 조회 중 오류가 발생했습니다."));
		}
	}

	@GetMapping("/{ciSn}")
	public ApiResponse<HomepageCiVO> getCi(@PathVariable Integer ciSn) {
		try {
			HomepageCiVO ci = homepageCiService.getCi(ciSn);
			return ci != null
				? ApiResponse.success("CI 상세를 조회했습니다.", ci)
				: ApiResponse.error("CI 정보를 찾을 수 없습니다.");
		} catch (Exception e) {
			log.error("CI 상세 조회 오류", e);
			return ApiResponse.error(ApiResponse.messageOf(e, "CI 상세 조회 중 오류가 발생했습니다."));
		}
	}

	@PostMapping
	public ApiResponse<HomepageCiVO> createCi(@RequestBody HomepageCiVO ci, HttpSession session) {
		try {
			ci.setCiSn(null);
			String actor = sessionAdminName(session);
			ci.setRgtr(actor);
			ci.setMdtr(actor);
			return ApiResponse.success("CI가 등록되었습니다.", homepageCiService.saveCi(ci));
		} catch (Exception e) {
			log.error("CI 등록 오류", e);
			return ApiResponse.error(ApiResponse.messageOf(e, "CI 등록 중 오류가 발생했습니다."));
		}
	}

	@PutMapping("/{ciSn}")
	public ApiResponse<HomepageCiVO> updateCi(@PathVariable Integer ciSn, @RequestBody HomepageCiVO ci, HttpSession session) {
		try {
			ci.setCiSn(ciSn);
			ci.setMdtr(sessionAdminName(session));
			return ApiResponse.success("CI가 수정되었습니다.", homepageCiService.saveCi(ci));
		} catch (Exception e) {
			log.error("CI 수정 오류", e);
			return ApiResponse.error(ApiResponse.messageOf(e, "CI 수정 중 오류가 발생했습니다."));
		}
	}

	@PutMapping("/{ciSn}/seq")
	public ApiResponse<Void> updateCiSeq(@PathVariable Integer ciSn, @RequestParam Integer sortSeq, HttpSession session) {
		try {
			homepageCiService.updateCiSeq(ciSn, sortSeq, sessionAdminName(session));
			return ApiResponse.success("순서가 변경되었습니다.", null);
		} catch (Exception e) {
			log.error("CI 순서 변경 오류", e);
			return ApiResponse.error(ApiResponse.messageOf(e, "CI 순서 변경 중 오류가 발생했습니다."));
		}
	}

	@DeleteMapping("/{ciSn}")
	public ApiResponse<Void> deleteCi(@PathVariable Integer ciSn, HttpSession session) {
		try {
			homepageCiService.deleteCi(ciSn, sessionAdminName(session));
			return ApiResponse.success("CI가 삭제되었습니다.", null);
		} catch (Exception e) {
			log.error("CI 삭제 오류", e);
			return ApiResponse.error(ApiResponse.messageOf(e, "CI 삭제 중 오류가 발생했습니다."));
		}
	}
}
