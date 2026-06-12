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
	public ApiResponse<Void> updateBannerSeq(@PathVariable Integer bnrIdx, @RequestParam Integer bnrSeq) {
		bannerService.updateBannerSeq(bnrIdx, bnrSeq);
		return ApiResponse.success("배너 순서 변경 성공", null);
	}
}
