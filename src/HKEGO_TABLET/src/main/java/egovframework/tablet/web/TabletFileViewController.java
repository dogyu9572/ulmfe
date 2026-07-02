package egovframework.tablet.web;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Slf4j
@RestController
@RequestMapping("/uploads")
public class TabletFileViewController {
	@Value("${file.upload.path}")
	private String uploadPath;

	@GetMapping("/**")
	public ResponseEntity<Resource> serveFile(HttpServletRequest request) {
		try {
			String requestUri = request.getRequestURI();
			String filePath = requestUri.startsWith("/uploads") ? requestUri.substring("/uploads".length()) : requestUri;
			if (filePath.startsWith("/")) {
				filePath = filePath.substring(1);
			}
			Path basePath = Paths.get(uploadPath).toAbsolutePath().normalize();
			Path resolved = basePath.resolve(filePath).normalize();
			if (!resolved.startsWith(basePath)) {
				return ResponseEntity.status(403).build();
			}
			File file = resolved.toFile();
			if (!file.exists() || !file.isFile()) {
				return ResponseEntity.notFound().build();
			}
			String contentType = Files.probeContentType(resolved);
			if (contentType == null) {
				contentType = contentTypeFromPath(filePath);
			}
			return ResponseEntity.ok()
				.contentType(MediaType.parseMediaType(contentType))
				.body(new FileSystemResource(file));
		} catch (Exception e) {
			log.error("태블릿 파일 제공 오류", e);
			return ResponseEntity.internalServerError().build();
		}
	}

	private String contentTypeFromPath(String filePath) {
		if (filePath == null) return "application/octet-stream";
		String lower = filePath.toLowerCase();
		if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
		if (lower.endsWith(".png")) return "image/png";
		if (lower.endsWith(".gif")) return "image/gif";
		if (lower.endsWith(".webp")) return "image/webp";
		if (lower.endsWith(".pdf")) return "application/pdf";
		return "application/octet-stream";
	}
}
