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
import egovframework.let.adm.service.EgovAccessEnvironmentService;
import egovframework.let.adm.service.vo.AccessEnvironmentSettingVO;
import egovframework.let.adm.service.vo.AdminAllowedIpVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/admin/access-env")
@RequiredArgsConstructor
public class EgovAccessEnvironmentManageApiController {
	private final EgovAccessEnvironmentService accessEnvironmentService;

	@GetMapping("/setting")
	public ApiResponse<AccessEnvironmentSettingVO> getSetting() {
		try {
			return ApiResponse.success("접속 환경설정을 조회했습니다.", accessEnvironmentService.getSetting());
		} catch (Exception e) {
			log.error("접속 환경설정 조회 오류", e);
			return ApiResponse.error("접속 환경설정 조회 중 오류가 발생했습니다: " + e.getMessage());
		}
	}

	@PutMapping("/setting")
	public ApiResponse<AccessEnvironmentSettingVO> saveSetting(@RequestBody AccessEnvironmentSettingVO setting) {
		try {
			return ApiResponse.success("접속시간 설정이 저장되었습니다.", accessEnvironmentService.saveSetting(setting));
		} catch (Exception e) {
			log.error("접속시간 설정 저장 오류", e);
			return ApiResponse.error("접속시간 설정 저장 중 오류가 발생했습니다: " + e.getMessage());
		}
	}

	@GetMapping("/allowed-ips")
	public ApiResponse<Map<String, Object>> getAllowedIpList(
		@RequestParam(value = "prmIpAddr", required = false) String prmIpAddr,
		@RequestParam(value = "startDate", required = false) String startDate,
		@RequestParam(value = "endDate", required = false) String endDate,
		@RequestParam(value = "page", defaultValue = "1") int page,
		@RequestParam(value = "size", defaultValue = "10") int size) {
		try {
			Map<String, Object> result = accessEnvironmentService.getAllowedIpList(prmIpAddr, startDate, endDate, page, size);
			return ApiResponse.success("접속 IP 목록을 조회했습니다.", result);
		} catch (Exception e) {
			log.error("접속 IP 목록 조회 오류", e);
			return ApiResponse.error("접속 IP 목록 조회 중 오류가 발생했습니다: " + e.getMessage());
		}
	}

	@GetMapping("/allowed-ips/{prmIpSn}")
	public ApiResponse<AdminAllowedIpVO> getAllowedIp(@PathVariable Integer prmIpSn) {
		try {
			AdminAllowedIpVO allowedIp = accessEnvironmentService.getAllowedIp(prmIpSn);
			if (allowedIp == null) {
				return ApiResponse.error("접속 IP 정보를 찾을 수 없습니다.");
			}
			return ApiResponse.success("접속 IP 정보를 조회했습니다.", allowedIp);
		} catch (Exception e) {
			log.error("접속 IP 상세 조회 오류", e);
			return ApiResponse.error("접속 IP 상세 조회 중 오류가 발생했습니다: " + e.getMessage());
		}
	}

	@PostMapping("/allowed-ips")
	public ApiResponse<AdminAllowedIpVO> createAllowedIp(@RequestBody AdminAllowedIpVO allowedIp) {
		try {
			return ApiResponse.success("접속 IP가 등록되었습니다.", accessEnvironmentService.saveAllowedIp(allowedIp));
		} catch (Exception e) {
			log.error("접속 IP 등록 오류", e);
			return ApiResponse.error("접속 IP 등록 중 오류가 발생했습니다: " + e.getMessage());
		}
	}

	@PutMapping("/allowed-ips/{prmIpSn}")
	public ApiResponse<AdminAllowedIpVO> updateAllowedIp(@PathVariable Integer prmIpSn, @RequestBody AdminAllowedIpVO allowedIp) {
		try {
			allowedIp.setPrmIpSn(prmIpSn);
			return ApiResponse.success("접속 IP가 수정되었습니다.", accessEnvironmentService.saveAllowedIp(allowedIp));
		} catch (Exception e) {
			log.error("접속 IP 수정 오류", e);
			return ApiResponse.error("접속 IP 수정 중 오류가 발생했습니다: " + e.getMessage());
		}
	}

	@DeleteMapping("/allowed-ips/{prmIpSn}")
	public ApiResponse<Void> deleteAllowedIp(@PathVariable Integer prmIpSn) {
		try {
			accessEnvironmentService.deleteAllowedIp(prmIpSn);
			return ApiResponse.success("접속 IP가 삭제되었습니다.", null);
		} catch (Exception e) {
			log.error("접속 IP 삭제 오류", e);
			return ApiResponse.error("접속 IP 삭제 중 오류가 발생했습니다: " + e.getMessage());
		}
	}

	@PostMapping("/allowed-ips/delete")
	public ApiResponse<Void> deleteAllowedIps(@RequestBody Map<String, List<Integer>> body) {
		try {
			accessEnvironmentService.deleteAllowedIps(body.get("prmIpSns"));
			return ApiResponse.success("선택한 접속 IP가 삭제되었습니다.", null);
		} catch (Exception e) {
			log.error("접속 IP 선택삭제 오류", e);
			return ApiResponse.error("접속 IP 선택삭제 중 오류가 발생했습니다: " + e.getMessage());
		}
	}
}
