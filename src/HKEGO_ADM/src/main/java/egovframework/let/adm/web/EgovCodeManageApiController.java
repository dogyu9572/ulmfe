package egovframework.let.adm.web;

import egovframework.com.cmm.ApiResponse;
import egovframework.let.adm.service.vo.CodeDtVO;
import egovframework.let.adm.service.vo.CodeMaVO;
import egovframework.let.adm.service.EgovCodeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/admin/codes")
@RequiredArgsConstructor
public class EgovCodeManageApiController {
	private final EgovCodeService codeService;

	@GetMapping("/master")
	public ApiResponse<List<CodeMaVO>> getCodeMasterList(
		@RequestParam(value = "useYn", required = false) String useYn) {
		List<CodeMaVO> result = codeService.getCodeMaList(useYn);
		return ApiResponse.success("공통코드 마스터 목록을 조회했습니다.", result);
	}

	@GetMapping("/master/{codeId}")
	public ApiResponse<CodeMaVO> getCodeMaster(@PathVariable String codeId) {
		CodeMaVO result = codeService.getCodeMa(codeId);
		if (result == null) {
			return ApiResponse.error("해당하는 공통코드를 찾을 수 없습니다.");
		}
		return ApiResponse.success("공통코드 마스터를 조회했습니다.", result);
	}

	@GetMapping("/detail")
	public ApiResponse<List<CodeDtVO>> getCodeDetailList(
		@RequestParam(value = "cdId", required = false) String cdId,
		@RequestParam(value = "codeId", required = false) String codeId,
		@RequestParam(value = "useYn", required = false) String useYn) {
		String resolvedCdId = (cdId != null && !cdId.isBlank()) ? cdId : codeId;
		List<CodeDtVO> result = codeService.getCodeDtList(resolvedCdId, useYn);
		return ApiResponse.success("공통코드 상세 목록을 조회했습니다.", result);
	}

	@PostMapping("/master")
	public ApiResponse<Void> createCodeMaster(@RequestBody CodeMaVO codeMa) {
		codeService.createCodeMa(codeMa);
		return ApiResponse.success("공통코드 마스터가 등록되었습니다.", null);
	}

	@PostMapping("/detail")
	public ApiResponse<Void> createCodeDetail(@RequestBody CodeDtVO codeDt) {
		codeService.createCodeDt(codeDt);
		return ApiResponse.success("공통코드 상세가 등록되었습니다.", null);
	}

	@PutMapping("/master/{codeId}")
	public ApiResponse<Void> updateCodeMaster(@PathVariable String codeId, @RequestBody CodeMaVO codeMa) {
		codeMa.setCodeId(codeId);
		codeService.updateCodeMa(codeMa);
		return ApiResponse.success("공통코드 마스터가 수정되었습니다.", null);
	}

	@PutMapping("/detail/{codeId}/{code}")
	public ApiResponse<Void> updateCodeDetail(
		@PathVariable String codeId,
		@PathVariable String code,
		@RequestBody CodeDtVO codeDt) {
		codeDt.setCodeId(codeId);
		codeDt.setCode(code);
		codeService.updateCodeDt(codeDt);
		return ApiResponse.success("공통코드 상세가 수정되었습니다.", null);
	}

	@DeleteMapping("/master/{codeId}")
	public ApiResponse<Void> deleteCodeMaster(@PathVariable String codeId) {
		codeService.deleteCodeMa(codeId);
		return ApiResponse.success("공통코드 마스터가 삭제되었습니다.", null);
	}

	@DeleteMapping("/detail/{codeId}/{code}")
	public ApiResponse<Void> deleteCodeDetail(
		@PathVariable String codeId,
		@PathVariable String code) {
		codeService.deleteCodeDt(codeId, code);
		return ApiResponse.success("공통코드 상세가 삭제되었습니다.", null);
	}
}

