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
import egovframework.let.adm.service.EgovHomepageOrgChartService;
import egovframework.let.adm.service.vo.HomepageOrgChartVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/admin/org-chart")
@RequiredArgsConstructor
public class EgovHomepageOrgChartManageApiController {
	private final EgovHomepageOrgChartService homepageOrgChartService;

	@GetMapping
	public ApiResponse<List<HomepageOrgChartVO>> getOrgChartMembers(
		@RequestParam("frstClsfCd") String frstClsfCd,
		@RequestParam("scndClsfCd") String scndClsfCd) {
		try {
			return ApiResponse.success("조직도 항목을 조회했습니다.",
				homepageOrgChartService.getOrgChartMembers(frstClsfCd, scndClsfCd));
		} catch (Exception e) {
			log.error("조직도 항목 조회 오류", e);
			return ApiResponse.error("조직도 항목 조회 중 오류가 발생했습니다: " + e.getMessage());
		}
	}

	@PostMapping
	public ApiResponse<HomepageOrgChartVO> createOrgChartMember(@RequestBody HomepageOrgChartVO member) {
		try {
			return ApiResponse.success("조직도 항목이 등록되었습니다.", homepageOrgChartService.saveOrgChartMember(member));
		} catch (Exception e) {
			log.error("조직도 항목 등록 오류", e);
			return ApiResponse.error("조직도 항목 등록 중 오류가 발생했습니다: " + e.getMessage());
		}
	}

	@PutMapping("/{orgMbrSn}")
	public ApiResponse<HomepageOrgChartVO> updateOrgChartMember(
		@PathVariable Integer orgMbrSn,
		@RequestBody HomepageOrgChartVO member) {
		try {
			member.setOrgMbrSn(orgMbrSn);
			return ApiResponse.success("조직도 항목이 수정되었습니다.", homepageOrgChartService.saveOrgChartMember(member));
		} catch (Exception e) {
			log.error("조직도 항목 수정 오류", e);
			return ApiResponse.error("조직도 항목 수정 중 오류가 발생했습니다: " + e.getMessage());
		}
	}

	@DeleteMapping("/{orgMbrSn}")
	public ApiResponse<Void> deleteOrgChartMember(
		@PathVariable Integer orgMbrSn,
		@RequestParam(value = "deltr", required = false) String deltr) {
		try {
			homepageOrgChartService.deleteOrgChartMember(orgMbrSn, deltr);
			return ApiResponse.success("조직도 항목이 삭제되었습니다.", null);
		} catch (Exception e) {
			log.error("조직도 항목 삭제 오류", e);
			return ApiResponse.error("조직도 항목 삭제 중 오류가 발생했습니다: " + e.getMessage());
		}
	}
}
