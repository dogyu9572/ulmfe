package egovframework.let.adm.web;

import egovframework.com.cmm.ApiResponse;
import egovframework.let.adm.service.vo.FileInfoVO;
import egovframework.let.adm.service.EgovFileInfoService;
import egovframework.let.adm.service.EgovFileUploadService;
import egovframework.com.security.UploadMediaTypeResolver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 에디터 이미지·ATCH_FILE_INFO 기반 첨부/썸네일 업로드
 */
@Slf4j
@RestController
@RequestMapping("/api/admin/upload")
@RequiredArgsConstructor
public class EgovFileUploadManageApiController {

	private final EgovFileUploadService fileUploadService;
	private final EgovFileInfoService fileInfoService;

	@PostMapping("/image")
	public ResponseEntity<ApiResponse<Map<String, String>>> uploadImage(
			@RequestParam("file") MultipartFile file,
			@RequestParam(value = "menuType", required = false) String menuType,
			@RequestParam(value = "menuId", required = false) String menuId) {
		try {
			String url = fileUploadService.saveFile(file, menuType, menuId);
			Map<String, String> data = new HashMap<>();
			data.put("url", url);
			return ResponseEntity.ok(ApiResponse.success("이미지 업로드 완료", data));
		} catch (Exception e) {
			log.error("이미지 업로드 오류", e);
			return ResponseEntity.ok(ApiResponse.error(e.getMessage()));
		}
	}

	@PostMapping("/file-info-image")
	public ResponseEntity<ApiResponse<Map<String, String>>> uploadImageWithFileInfo(
			@RequestParam("file") MultipartFile file,
			@RequestParam(value = "menuType", required = false) String menuType,
			@RequestParam(value = "fiId", required = false) String fiId) {
		try {
			FileInfoVO fileInfo = fileInfoService.uploadImageWithFileInfo(file, menuType, fiId);
			Map<String, String> data = new HashMap<>();
			data.put("fiId", fileInfo.getFiId());
			data.put("fiSn", String.valueOf(fileInfo.getFiSn()));
			data.put("fileUrl", fileInfo.getFiPath());
			data.put("fileOriginName", fileInfo.getFiOriginName());
			return ResponseEntity.ok(ApiResponse.success("파일 업로드 완료", data));
		} catch (Exception e) {
			log.error("파일 업로드 오류", e);
			return ResponseEntity.ok(ApiResponse.error(e.getMessage()));
		}
	}

	@PostMapping("/file-info-attach")
	public ResponseEntity<ApiResponse<Map<String, String>>> uploadAttachmentWithFileInfo(
			@RequestParam("file") MultipartFile file,
			@RequestParam(value = "menuType", required = false) String menuType,
			@RequestParam(value = "fiId", required = false) String fiId) {
		try {
			String mt = (menuType == null || menuType.isBlank()) ? "bbs_attach" : menuType.trim();
			FileInfoVO fileInfo = fileInfoService.uploadAttachmentWithFileInfo(file, mt, fiId);
			Map<String, String> data = new HashMap<>();
			data.put("fiId", fileInfo.getFiId());
			data.put("fiSn", String.valueOf(fileInfo.getFiSn()));
			data.put("fileUrl", fileInfo.getFiPath());
			data.put("fileOriginName", fileInfo.getFiOriginName());
			return ResponseEntity.ok(ApiResponse.success("첨부파일 업로드 완료", data));
		} catch (Exception e) {
			log.error("첨부파일 업로드 오류", e);
			return ResponseEntity.ok(ApiResponse.error(e.getMessage()));
		}
	}

	@GetMapping("/download/{fiId}/{fiSn}")
	public ResponseEntity<Resource> downloadFile(
			@PathVariable String fiId,
			@PathVariable Integer fiSn) {
		try {
			FileInfoVO fileInfo = fileInfoService.getFileInfoByIdAndSn(fiId, fiSn);
			if (fileInfo == null) {
				return ResponseEntity.notFound().build();
			}
			Path physical = fileInfoService.resolvePhysicalPath(fileInfo);
			String originName = fileInfo.getFiOriginName() == null || fileInfo.getFiOriginName().isBlank()
					? "download" + (fileInfo.getFiExt() == null ? "" : fileInfo.getFiExt())
					: fileInfo.getFiOriginName().trim();
			String contentType = UploadMediaTypeResolver.resolveForPath(
					physical.getFileName().toString(),
					fileInfo.getFiContentType());
			ContentDisposition disposition = ContentDisposition.attachment()
					.filename(originName, StandardCharsets.UTF_8)
					.build();
			return ResponseEntity.ok()
					.header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
					.contentType(MediaType.parseMediaType(contentType))
					.body(new FileSystemResource(physical));
		} catch (Exception e) {
			log.error("첨부 다운로드 오류: fiId={}, fiSn={}", fiId, fiSn, e);
			return ResponseEntity.notFound().build();
		}
	}

	@GetMapping("/info/{fiId}")
	public ResponseEntity<ApiResponse<Map<String, String>>> getFileInfo(@PathVariable String fiId) {
		try {
			FileInfoVO fileInfo = fileInfoService.getFileInfoById(fiId);
			if (fileInfo == null) {
				return ResponseEntity.ok(ApiResponse.error("파일 정보를 찾을 수 없습니다."));
			}
			Map<String, String> data = new HashMap<>();
			data.put("fiId", fileInfo.getFiId());
			data.put("fileUrl", fileInfo.getFiPath());
			data.put("fileOriginName", fileInfo.getFiOriginName());
			return ResponseEntity.ok(ApiResponse.success("파일 정보 조회 성공", data));
		} catch (Exception e) {
			log.error("파일 정보 조회 오류", e);
			return ResponseEntity.ok(ApiResponse.error(e.getMessage()));
		}
	}

	@GetMapping("/infos/{fiId}")
	public ResponseEntity<ApiResponse<List<Map<String, String>>>> getFileInfoList(@PathVariable String fiId) {
		try {
			List<FileInfoVO> fileInfos = fileInfoService.getFileInfoListById(fiId);
			if (fileInfos == null || fileInfos.isEmpty()) {
				return ResponseEntity.ok(ApiResponse.error("파일 정보를 찾을 수 없습니다."));
			}
			List<Map<String, String>> data = new ArrayList<>();
			for (FileInfoVO fileInfo : fileInfos) {
				Map<String, String> row = new HashMap<>();
				row.put("fiId", fileInfo.getFiId());
				row.put("fiSn", String.valueOf(fileInfo.getFiSn()));
				row.put("fileUrl", fileInfo.getFiPath());
				row.put("fileOriginName", fileInfo.getFiOriginName());
				data.add(row);
			}
			return ResponseEntity.ok(ApiResponse.success("파일 목록 조회 성공", data));
		} catch (Exception e) {
			log.error("파일 목록 조회 오류", e);
			return ResponseEntity.ok(ApiResponse.error(e.getMessage()));
		}
	}

	@DeleteMapping("/info/{fiId}/{fiSn}")
	public ResponseEntity<ApiResponse<Void>> deleteFileInfo(
			@PathVariable String fiId,
			@PathVariable Integer fiSn) {
		try {
			fileInfoService.deleteFileInfoByIdAndSn(fiId, fiSn);
			return ResponseEntity.ok(ApiResponse.success("파일이 삭제되었습니다.", null));
		} catch (Exception e) {
			log.error("파일 삭제 오류: fiId={}, fiSn={}", fiId, fiSn, e);
			return ResponseEntity.ok(ApiResponse.error(e.getMessage()));
		}
	}
}
