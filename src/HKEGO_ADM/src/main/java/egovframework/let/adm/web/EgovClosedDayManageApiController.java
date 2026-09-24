// 관리자 휴관일 관리 API 컨트롤러
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
import egovframework.let.adm.service.EgovClosedDayService;
import egovframework.let.adm.service.vo.ClosedDayVO;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/admin/closed-day")
@RequiredArgsConstructor
public class EgovClosedDayManageApiController {

	private final EgovClosedDayService closedDayService;

	/** 등록자·수정자는 요청 본문이 아니라 세션에서 가져온다. 게시글 관리와 같은 방식이다. */
	private String sessionAdminName(HttpSession session) {
		Object value = session == null ? null : session.getAttribute("adminName");
		return value == null ? null : value.toString();
	}

	@GetMapping("/list")
	public ApiResponse<Map<String, Object>> getClosedDayList(
			@RequestParam(required = false) String useYn,
			@RequestParam(required = false) String clsrSeCd,
			@RequestParam(required = false) String startDate,
			@RequestParam(required = false) String endDate,
			@RequestParam(required = false) String searchKeyword,
			@RequestParam(defaultValue = "1") int page,
			@RequestParam(defaultValue = "10") int size) {
		Map<String, Object> data = closedDayService.getClosedDayListPage(
				useYn, clsrSeCd, startDate, endDate, searchKeyword, page, size);
		return ApiResponse.success("휴관일 목록 조회 성공", data);
	}

	@GetMapping("/regular-day")
	public ApiResponse<String> getRegularClosedDay() {
		return ApiResponse.success("정기휴관 요일 조회 성공", closedDayService.getRegularClosedDayCode());
	}

	@PutMapping("/regular-day")
	public ApiResponse<String> saveRegularClosedDay(@RequestBody Map<String, String> body, HttpSession session) {
		String saved = closedDayService.saveRegularClosedDayCode(
				body.get("rglrClsrDayCd"), sessionAdminName(session));
		return ApiResponse.success("정기휴관 요일 저장 성공", saved);
	}

	@GetMapping("/{clsrSn}")
	public ApiResponse<ClosedDayVO> getClosedDayById(@PathVariable Long clsrSn) {
		return ApiResponse.success("휴관일 상세 조회 성공", closedDayService.getClosedDayById(clsrSn));
	}

	@PostMapping
	public ApiResponse<ClosedDayVO> createClosedDay(@RequestBody ClosedDayVO request, HttpSession session) {
		ClosedDayVO created = closedDayService.createClosedDay(request, sessionAdminName(session));
		return ApiResponse.success("휴관일 등록 성공", created);
	}

	@PutMapping("/{clsrSn}")
	public ApiResponse<ClosedDayVO> updateClosedDay(
			@PathVariable Long clsrSn, @RequestBody ClosedDayVO request, HttpSession session) {
		ClosedDayVO updated = closedDayService.updateClosedDay(clsrSn, request, sessionAdminName(session));
		return ApiResponse.success("휴관일 수정 성공", updated);
	}

	@DeleteMapping("/{clsrSn}")
	public ApiResponse<Void> deleteClosedDay(@PathVariable Long clsrSn, HttpSession session) {
		closedDayService.deleteClosedDay(clsrSn, sessionAdminName(session));
		return ApiResponse.success("휴관일 삭제 성공", null);
	}

	@PostMapping("/delete")
	public ApiResponse<Integer> deleteClosedDays(@RequestBody Map<String, List<Long>> body, HttpSession session) {
		int deleted = closedDayService.deleteClosedDays(body.get("clsrSnList"), sessionAdminName(session));
		return ApiResponse.success("휴관일 선택 삭제 성공", deleted);
	}
}
