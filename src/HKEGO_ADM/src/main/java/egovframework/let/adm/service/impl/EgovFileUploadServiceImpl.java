package egovframework.let.adm.service.impl;

import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.egovframe.rte.fdl.cmmn.EgovAbstractServiceImpl;

import egovframework.let.adm.service.EgovFileUploadService;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import egovframework.com.security.UploadFileValidator;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

/**
 * 에디터/게시판용 이미지 등 파일을 물리적으로 저장 (OMRON_ADM EgovFileInfoService 로직 참고)
 */
@Slf4j
@Service("egovFileUploadService")
public class EgovFileUploadServiceImpl extends EgovAbstractServiceImpl implements EgovFileUploadService {

	@Value("${file.upload.path}")
	private String uploadPath;

	/**
	 * 이미지 파일을 저장하고 접근 URL 경로 반환
	 * @param file 업로드 파일
	 * @param menuType 메뉴 구분 (예: bbs)
	 * @param menuId 메뉴 ID (예: 게시판 ID), null 가능
	 * @return 브라우저에서 접근할 경로 (예: /uploads/bbs/xxx.png)
	 */
	public String saveFile(MultipartFile file, String menuType, String menuId) {
		if (file == null || file.isEmpty()) {
			throw new RuntimeException("업로드할 파일이 없습니다.");
		}
		UploadFileValidator.validateImage(file);
		String contentType = file.getContentType();
		if (contentType == null || !contentType.startsWith("image/")) {
			throw new RuntimeException("이미지 파일만 업로드 가능합니다.");
		}
		String originalFilename = file.getOriginalFilename();
		if (originalFilename == null) {
			originalFilename = "image";
		}
		String ext = "";
		if (originalFilename.contains(".")) {
			ext = originalFilename.substring(originalFilename.lastIndexOf("."));
		} else {
			if (contentType.contains("jpeg") || contentType.contains("jpg")) ext = ".jpg";
			else if (contentType.contains("png")) ext = ".png";
			else if (contentType.contains("gif")) ext = ".gif";
			else ext = ".png";
		}
		String subPath = buildMenuPath(menuType, menuId);
		// 짧은 파일명: UUID 앞 16자만 사용 (예: 4aa23547fbc34e52.jpg)
		String uniqueName = UUID.randomUUID().toString().replace("-", "").substring(0, 16) + ext;
		Path dir = Paths.get(uploadPath, subPath);
		try {
			if (!Files.exists(dir)) {
				Files.createDirectories(dir);
			}
			Path target = dir.resolve(uniqueName);
			Files.copy(file.getInputStream(), target);
			String urlPath = "/uploads/" + subPath.replace("\\", "/") + uniqueName;
			log.info("파일 저장 성공: {}", target);
			return urlPath;
		} catch (Exception e) {
			log.error("파일 저장 실패", e);
			throw new RuntimeException("파일 저장 중 오류가 발생했습니다: " + e.getMessage());
		}
	}

	private String buildMenuPath(String menuType, String menuId) {
		if (menuType == null || menuType.isBlank()) {
			return "file/";
		}
		switch (menuType.toLowerCase()) {
			case "bbs":
				return (menuId != null && !menuId.isBlank()) ? "bbs/" + menuId + "/" : "bbs/";
			case "popup":
				return "popup/";
			case "schedule":
				return "schedule/";
			case "product":
				return "product/";
			default:
				return "file/";
		}
	}
}
