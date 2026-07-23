package egovframework.let.usr.web;

import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.util.List;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import egovframework.com.cmm.ApiResponse;
import egovframework.com.security.UploadMediaTypeResolver;
import egovframework.let.usr.service.EgovPublicFileService;
import egovframework.let.usr.service.vo.PublicFileInfoVO;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/user/files")
@RequiredArgsConstructor
public class EgovPublicFileApiController {
	private final EgovPublicFileService publicFileService;

	@GetMapping("/{fileId}")
	public ApiResponse<List<PublicFileInfoVO>> getFiles(@PathVariable String fileId) {
		return ApiResponse.success("첨부파일 목록을 조회했습니다.", publicFileService.getFiles(fileId));
	}

	@GetMapping("/{fileId}/{fileSeq}/download")
	public ResponseEntity<Resource> download(
		@PathVariable String fileId,
		@PathVariable int fileSeq
	) {
		try {
			PublicFileInfoVO fileInfo = publicFileService.getFile(fileId, fileSeq);
			if (fileInfo == null) return ResponseEntity.notFound().build();
			Path physicalPath = publicFileService.resolvePhysicalPath(fileInfo);
			String fileName = fileInfo.getOriginalFileName();
			if (fileName == null || fileName.isBlank()) fileName = "download";
			String contentType = UploadMediaTypeResolver.resolveForPath(
				physicalPath.getFileName().toString(),
				fileInfo.getContentType()
			);
			return ResponseEntity.ok()
				.header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment()
					.filename(fileName, StandardCharsets.UTF_8)
					.build().toString())
				.contentType(MediaType.parseMediaType(contentType))
				.body(new FileSystemResource(physicalPath));
		} catch (IllegalArgumentException e) {
			return ResponseEntity.notFound().build();
		}
	}
}
