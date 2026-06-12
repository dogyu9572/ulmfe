package egovframework.let.adm.web;

import egovframework.let.adm.service.vo.AdminDto;
import egovframework.com.cmm.ApiResponse;
import egovframework.let.adm.service.vo.AdminInfoVO;
import egovframework.let.adm.service.EgovAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/admins")
@RequiredArgsConstructor
public class EgovAdminManageApiController {
	private final EgovAdminService adminService;

	@GetMapping
	public ResponseEntity<ApiResponse<Map<String, Object>>> list(
		@RequestParam(required = false) String status,
		@RequestParam(required = false) String role,
		@RequestParam(defaultValue = "1") int page,
		@RequestParam(defaultValue = "10") int size) {
		Map<String, Object> data = adminService.findAllPage(status, role, page, size);
		@SuppressWarnings("unchecked")
		List<AdminInfoVO> admins = (List<AdminInfoVO>) data.get("list");
		List<AdminDto> dtos = admins.stream().map(this::toDto).collect(Collectors.toList());
		data.put("list", dtos);
		return ResponseEntity.ok(ApiResponse.success("관리자 목록 조회", data));
	}

	@PostMapping
	public ResponseEntity<ApiResponse<Void>> create(@RequestBody AdminDto dto,
		@RequestParam String password) {
		AdminInfoVO admin = new AdminInfoVO();
		admin.setId(dto.getId());
		admin.setUserNm(dto.getUserNm());
		admin.setEmlAddr(dto.getEmlAddr());
		admin.setAcntSttsCd(dto.getAcntSttsCd());
		admin.setAuthrtCd(dto.getAuthrtCd());
		adminService.create(admin, password);
		return ResponseEntity.ok(ApiResponse.success("관리자를 생성했습니다.", null));
	}

	@PutMapping("/{adminId}")
	public ResponseEntity<ApiResponse<Void>> update(@PathVariable String adminId, @RequestBody AdminDto dto) {
		AdminInfoVO admin = adminService.findById(adminId);
		if (admin == null) {
			return ResponseEntity.badRequest().body(ApiResponse.error("관리자를 찾을 수 없습니다."));
		}
		admin.setUserNm(dto.getUserNm());
		admin.setEmlAddr(dto.getEmlAddr());
		admin.setAcntSttsCd(dto.getAcntSttsCd());
		admin.setAuthrtCd(dto.getAuthrtCd());
		adminService.update(admin);
		return ResponseEntity.ok(ApiResponse.success("관리자 정보를 수정했습니다.", null));
	}

	@PutMapping("/{adminId}/password")
	public ResponseEntity<ApiResponse<Void>> changePassword(@PathVariable String adminId,
		@RequestParam String password) {
		adminService.changePassword(adminId, password);
		return ResponseEntity.ok(ApiResponse.success("비밀번호를 변경했습니다.", null));
	}

	@DeleteMapping("/{adminId}")
	public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String adminId) {
		adminService.delete(adminId);
		return ResponseEntity.ok(ApiResponse.success("관리자를 삭제했습니다.", null));
	}

	private AdminDto toDto(AdminInfoVO admin) {
		AdminDto dto = new AdminDto();
		dto.setId(admin.getId());
		dto.setUserNm(admin.getUserNm());
		dto.setEmlAddr(admin.getEmlAddr());
		dto.setAcntSttsCd(admin.getAcntSttsCd());
		dto.setAuthrtCd(admin.getAuthrtCd());
		return dto;
	}
}

