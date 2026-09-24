package egovframework.let.adm.web;

import egovframework.com.cmm.ApiResponse;
import egovframework.let.adm.service.vo.BannerDto;
import egovframework.let.adm.service.vo.BannerVO;
import egovframework.let.adm.service.EgovBannerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/admin/banner")
@RequiredArgsConstructor
public class EgovBannerManageApiController {

	private final EgovBannerService bannerService;

	@GetMapping("/list")
	public ApiResponse<Map<String, Object>> getBannerList(
			@RequestParam(defaultValue = "1") int page,
			@RequestParam(defaultValue = "10") int size) {
		Map<String, Object> data = bannerService.getBannerListPage(null, null, null, null, null, null, null, page, size);
		return ApiResponse.success("배너 목록 조회 성공", data);
	}

	@GetMapping("/search")
	public ApiResponse<Map<String, Object>> getBannerListWithCondition(
			@RequestParam(required = false) String useYn,
			@RequestParam(required = false) String startPublishDate,
			@RequestParam(required = false) String endPublishDate,
			@RequestParam(required = false) String startRegDate,
			@RequestParam(required = false) String endRegDate,
			@RequestParam(required = false) String searchType,
			@RequestParam(required = false) String searchKeyword,
			@RequestParam(defaultValue = "1") int page,
			@RequestParam(defaultValue = "10") int size) {
		Map<String, Object> data = bannerService.getBannerListPage(useYn, startPublishDate, endPublishDate,
				startRegDate, endRegDate, searchType, searchKeyword, page, size);
		return ApiResponse.success("배너 목록 조회 성공", data);
	}

	@GetMapping("/{bnrIdx}")
	public ApiResponse<BannerVO> getBannerById(@PathVariable Integer bnrIdx) {
		BannerVO banner = bannerService.getBannerById(bnrIdx);
		return ApiResponse.success("배너 상세 조회 성공", banner);
	}

	@PostMapping
	public ApiResponse<BannerVO> createBanner(@RequestBody BannerDto dto) {
		BannerVO created = bannerService.createBanner(dto);
		return ApiResponse.success("배너 등록 성공", created);
	}

	@PutMapping("/{bnrIdx}")
	public ApiResponse<BannerVO> updateBanner(@PathVariable Integer bnrIdx, @RequestBody BannerDto dto) {
		BannerVO updated = bannerService.updateBanner(bnrIdx, dto);
		return ApiResponse.success("배너 수정 성공", updated);
	}

	@DeleteMapping("/{bnrIdx}")
	public ApiResponse<Void> deleteBanner(@PathVariable Integer bnrIdx) {
		bannerService.deleteBanner(bnrIdx);
		return ApiResponse.success("배너 삭제 성공", null);
	}

	@PutMapping("/{bnrIdx}/seq")
	public ApiResponse<Void> updateBannerSeq(
			@PathVariable Integer bnrIdx,
			// 화면과 다른 이름(bnrSeq)을 요구해 순서 변경이 항상 400 이었다. 다른 관리 화면과 같은 sortSeq 로 맞춘다.
			@RequestParam(name = "sortSeq") Integer sortSeq) {
		try {
			bannerService.updateBannerSeq(bnrIdx, sortSeq);
			return ApiResponse.success("배너 순서 변경 성공", null);
		} catch (Exception e) {
			log.error("배너 순서 변경 오류: bnrIdx={}", bnrIdx, e);
			return ApiResponse.error(ApiResponse.messageOf(e, "배너 순서 변경 중 오류가 발생했습니다."));
		}
	}
}
