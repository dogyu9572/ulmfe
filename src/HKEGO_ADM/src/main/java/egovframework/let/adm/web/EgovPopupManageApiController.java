package egovframework.let.adm.web;

import egovframework.com.cmm.ApiResponse;
import egovframework.let.adm.service.vo.PopupDto;
import egovframework.let.adm.service.vo.FileInfoVO;
import egovframework.let.adm.service.vo.PopupVO;
import egovframework.let.adm.service.EgovFileInfoService;
import egovframework.let.adm.service.EgovPopupService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/admin/popup")
@RequiredArgsConstructor
public class EgovPopupManageApiController {

	private final EgovPopupService popupService;
	private final EgovFileInfoService fileInfoService;

	@GetMapping("/list")
	public ApiResponse<Map<String, Object>> getPopupList(
			@RequestParam(required = false) String useYn,
			@RequestParam(required = false) String startPublishDate,
			@RequestParam(required = false) String endPublishDate,
			@RequestParam(required = false) String startRegDate,
			@RequestParam(required = false) String endRegDate,
			@RequestParam(required = false) String searchType,
			@RequestParam(required = false) String searchKeyword,
			@RequestParam(defaultValue = "1") int page,
			@RequestParam(defaultValue = "10") int size) {
		Map<String, Object> data = popupService.getPopupListPage(useYn, startPublishDate, endPublishDate,
				startRegDate, endRegDate, searchType, searchKeyword, page, size);
		return ApiResponse.success("팝업 목록 조회 성공", data);
	}

	@GetMapping("/{popId}")
	public ApiResponse<PopupVO> getPopupById(@PathVariable Long popId) {
		PopupVO popup = popupService.getPopupById(popId);
		return ApiResponse.success("팝업 상세 조회 성공", popup);
	}

	@PostMapping(consumes = "application/json")
	public ApiResponse<PopupVO> createPopupJson(@RequestBody PopupDto dto) {
		PopupVO created = popupService.createPopup(dto);
		return ApiResponse.success("팝업 등록 성공", created);
	}

	@PostMapping(consumes = "multipart/form-data")
	public ApiResponse<PopupVO> createPopupMultipart(
			@RequestPart("popup") PopupDto dto,
			@RequestPart(value = "popImgFile", required = false) MultipartFile popImgFile) {
		if (popImgFile != null && !popImgFile.isEmpty()) {
			FileInfoVO fileInfo = fileInfoService.uploadPopupImage(popImgFile);
			dto.setPopImg(fileInfo.getFiId());
		}
		PopupVO created = popupService.createPopup(dto);
		return ApiResponse.success("팝업 등록 성공", created);
	}

	@PutMapping(value = "/{popId}", consumes = "application/json")
	public ApiResponse<PopupVO> updatePopupJson(@PathVariable Long popId, @RequestBody PopupDto dto) {
		PopupVO updated = popupService.updatePopup(popId, dto);
		return ApiResponse.success("팝업 수정 성공", updated);
	}

	@PutMapping(value = "/{popId}", consumes = "multipart/form-data")
	public ApiResponse<PopupVO> updatePopupMultipart(
			@PathVariable Long popId,
			@RequestPart("popup") PopupDto dto,
			@RequestPart(value = "popImgFile", required = false) MultipartFile popImgFile) {
		if (popImgFile != null && !popImgFile.isEmpty()) {
			FileInfoVO fileInfo = fileInfoService.uploadPopupImage(popImgFile);
			dto.setPopImg(fileInfo.getFiId());
		}
		PopupVO updated = popupService.updatePopup(popId, dto);
		return ApiResponse.success("팝업 수정 성공", updated);
	}

	@DeleteMapping("/{popId}")
	public ApiResponse<Void> deletePopup(@PathVariable Long popId) {
		popupService.deletePopup(popId);
		return ApiResponse.success("팝업 삭제 성공", null);
	}
}
