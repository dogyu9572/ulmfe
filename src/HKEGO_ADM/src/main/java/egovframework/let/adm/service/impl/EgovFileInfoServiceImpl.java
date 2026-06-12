package egovframework.let.adm.service.impl;

import jakarta.annotation.Resource;
import egovframework.let.adm.service.vo.FileInfoVO;
import egovframework.let.adm.service.impl.FileInfoDAO;
import egovframework.com.security.UploadFileValidator;
import egovframework.com.security.UploadMediaTypeResolver;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.egovframe.rte.fdl.cmmn.EgovAbstractServiceImpl;

import egovframework.let.adm.service.EgovFileInfoService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

/**
 * ATCH_FILE_INFO 테이블 기반 파일 정보 저장 (POP_IMG, 게시판 첨부·썸네일 등 FI_ID 저장용)
 */
@Slf4j
@Service("egovFileInfoService")
public class EgovFileInfoServiceImpl extends EgovAbstractServiceImpl implements EgovFileInfoService {

	@Resource(name = "fileInfoDAO")
	private FileInfoDAO fileInfoDAO;

	@Value("${file.upload.path}")
	private String uploadPath;

	private String generateFiId() {
		return UUID.randomUUID().toString().replace("-", "").substring(0, 16);
	}

	@Transactional
	public FileInfoVO uploadImageWithFileInfo(MultipartFile file, String menuType) {
		return uploadImageWithFileInfo(file, menuType, null);
	}

	@Transactional
	public FileInfoVO uploadImageWithFileInfo(MultipartFile file, String menuType, String existingFiId) {
		if (file == null || file.isEmpty()) {
			throw new RuntimeException("업로드할 파일이 없습니다.");
		}
		String contentType = file.getContentType();
		String origEarly = file.getOriginalFilename();
		boolean namePdf = origEarly != null && origEarly.toLowerCase().endsWith(".pdf");
		boolean productPdf = menuType != null && "product".equalsIgnoreCase(menuType.trim())
				&& (namePdf || (contentType != null && contentType.toLowerCase().contains("pdf")));
		if (productPdf) {
			UploadFileValidator.validateAttachment(file, true);
		} else {
			UploadFileValidator.validateImage(file);
		}
		if (contentType == null || (!contentType.startsWith("image/") && !productPdf)) {
			throw new RuntimeException("이미지 파일만 업로드 가능합니다. (상품 PDF 첨부는 product 구분으로 PDF만 가능)");
		}
		String originalFilename = file.getOriginalFilename();
		if (originalFilename == null) {
			originalFilename = productPdf ? "file.pdf" : "image";
		}
		String ext = "";
		if (originalFilename.contains(".")) {
			ext = originalFilename.substring(originalFilename.lastIndexOf("."));
		} else {
			if (contentType.contains("jpeg") || contentType.contains("jpg")) {
				ext = ".jpg";
			} else if (contentType.contains("png")) {
				ext = ".png";
			} else if (contentType.contains("gif")) {
				ext = ".gif";
			} else if (productPdf) {
				ext = ".pdf";
			} else {
				ext = ".png";
			}
		}

		String atchFileMngNo = (existingFiId == null || existingFiId.isBlank()) ? generateFiId() : existingFiId.trim();
		Integer maxSn = fileInfoDAO.selectMaxFiSnById(atchFileMngNo);
		int nextSn = (maxSn == null ? -1 : maxSn) + 1;
		String saveName = atchFileMngNo + "_" + nextSn + ext;
		String subPath = buildSubPath(menuType);
		Path dir = Paths.get(uploadPath, subPath);
		Path target = null;
		try {
			if (!Files.exists(dir)) {
				Files.createDirectories(dir);
			}
			target = dir.resolve(saveName);
			Files.copy(file.getInputStream(), target);
			String urlPath = "/uploads/" + subPath + saveName;
			FileInfoVO fileInfo = FileInfoVO.builder()
					.atchFileMngNo(atchFileMngNo)
					.fileSeq(nextSn)
					.orgnlFileNm(originalFilename)
					.strgFileNm(saveName)
					.atchFilePathNm(urlPath)
					.fileSz(file.getSize())
					.fileExtnNm(ext)
					.fileTypeNm(contentType)
					.build();
			fileInfoDAO.insertFileInfo(fileInfo);
			log.info("이미지 ATCH_FILE_INFO 등록: atchFileMngNo={}, sn={}, path={}, menuType={}", atchFileMngNo, nextSn, urlPath, menuType);
			return fileInfo;
		} catch (Exception e) {
			if (target != null) {
				try {
					Files.deleteIfExists(target);
				} catch (Exception cleanupEx) {
					log.warn("이미지 물리 파일 롤백 실패: {}", target, cleanupEx);
				}
			}
			log.error("이미지 업로드 실패", e);
			throw new RuntimeException("이미지 업로드 중 오류가 발생했습니다: " + e.getMessage());
		}
	}

	@Transactional
	public FileInfoVO uploadPopupImage(MultipartFile file) {
		return uploadImageWithFileInfo(file, "popup");
	}

	@Transactional
	public FileInfoVO uploadAttachmentWithFileInfo(MultipartFile file, String menuType) {
		return uploadAttachmentWithFileInfo(file, menuType, null);
	}

	@Transactional
	public FileInfoVO uploadAttachmentWithFileInfo(MultipartFile file, String menuType, String existingFiId) {
		if (file == null || file.isEmpty()) {
			throw new RuntimeException("업로드할 파일이 없습니다.");
		}
		String originalFilename = file.getOriginalFilename();
		if (originalFilename == null) {
			originalFilename = "file";
		}
		String ext = "";
		if (originalFilename.contains(".")) {
			ext = originalFilename.substring(originalFilename.lastIndexOf("."));
		} else {
			String contentType = file.getContentType();
			if (contentType != null && contentType.contains("pdf")) {
				ext = ".pdf";
			} else {
				ext = ".bin";
			}
		}
		UploadFileValidator.validateGeneralAttachment(file);
		String atchFileMngNo = (existingFiId == null || existingFiId.isBlank()) ? generateFiId() : existingFiId.trim();
		Integer maxSn = fileInfoDAO.selectMaxFiSnById(atchFileMngNo);
		int nextSn = (maxSn == null ? -1 : maxSn) + 1;
		String saveName = atchFileMngNo + "_" + nextSn + ext;
		String subPath = buildSubPath(menuType);
		Path dir = Paths.get(uploadPath, subPath);
		Path target = null;
		try {
			if (!Files.exists(dir)) {
				Files.createDirectories(dir);
			}
			target = dir.resolve(saveName);
			Files.copy(file.getInputStream(), target);
			String urlPath = "/uploads/" + subPath + saveName;
			String contentType = UploadMediaTypeResolver.resolve(file.getContentType(), originalFilename, ext);
			FileInfoVO fileInfo = FileInfoVO.builder()
					.atchFileMngNo(atchFileMngNo)
					.fileSeq(nextSn)
					.orgnlFileNm(originalFilename)
					.strgFileNm(saveName)
					.atchFilePathNm(urlPath)
					.fileSz(file.getSize())
					.fileExtnNm(ext)
					.fileTypeNm(contentType)
					.build();
			fileInfoDAO.insertFileInfo(fileInfo);
			log.info("첨부 ATCH_FILE_INFO 등록: atchFileMngNo={}, sn={}, path={}, menuType={}", atchFileMngNo, nextSn, urlPath, menuType);
			return fileInfo;
		} catch (Exception e) {
			if (target != null) {
				try {
					Files.deleteIfExists(target);
				} catch (Exception cleanupEx) {
					log.warn("첨부 물리 파일 롤백 실패: {}", target, cleanupEx);
				}
			}
			log.error("첨부 업로드 실패", e);
			throw new RuntimeException("첨부 업로드 중 오류가 발생했습니다: " + e.getMessage());
		}
	}

	public FileInfoVO getFileInfoById(String fiId) {
		return fileInfoDAO.selectFileInfoById(fiId);
	}

	public List<FileInfoVO> getFileInfoListById(String fiId) {
		return fileInfoDAO.selectFileInfoListById(fiId);
	}

	public FileInfoVO getFileInfoByIdAndSn(String fiId, Integer fiSn) {
		if (fiId == null || fiId.isBlank() || fiSn == null || fiSn < 0) {
			return null;
		}
		return fileInfoDAO.selectFileInfoByIdAndSn(fiId.trim(), fiSn);
	}

	public Path resolvePhysicalPath(FileInfoVO fileInfo) {
		if (fileInfo == null || fileInfo.getAtchFilePathNm() == null || fileInfo.getAtchFilePathNm().isBlank()) {
			throw new RuntimeException("파일 경로가 없습니다.");
		}
		String relPath = fileInfo.getAtchFilePathNm().trim();
		if (relPath.startsWith("/uploads/")) {
			relPath = relPath.substring("/uploads/".length());
		}
		Path basePath = Paths.get(uploadPath).toAbsolutePath().normalize();
		Path resolved = basePath.resolve(relPath).normalize();
		if (!resolved.startsWith(basePath)) {
			throw new RuntimeException("허용되지 않은 파일 경로입니다.");
		}
		if (!Files.isRegularFile(resolved)) {
			throw new RuntimeException("파일을 찾을 수 없습니다.");
		}
		return resolved;
	}

	@Transactional
	public void deleteFileInfoByIdAndSn(String fiId, Integer fiSn) {
		if (fiId == null || fiId.isBlank() || fiSn == null || fiSn < 0) {
			throw new RuntimeException("삭제할 파일 정보가 올바르지 않습니다.");
		}
		FileInfoVO fileInfo = fileInfoDAO.selectFileInfoByIdAndSn(fiId, fiSn);
		if (fileInfo == null) {
			throw new RuntimeException("삭제할 파일 정보를 찾을 수 없습니다.");
		}
		int deleted = fileInfoDAO.deleteFileInfoByIdAndSn(fiId, fiSn);
		if (deleted <= 0) {
			throw new RuntimeException("파일 메타 삭제에 실패했습니다.");
		}
		try {
			String relPath = fileInfo.getAtchFilePathNm() == null ? "" : fileInfo.getAtchFilePathNm().trim();
			if (relPath.startsWith("/uploads/")) {
				relPath = relPath.substring("/uploads/".length());
			}
			if (!relPath.isBlank()) {
				Path target = Paths.get(uploadPath, relPath);
				Files.deleteIfExists(target);
			}
		} catch (Exception e) {
			log.warn("파일 물리 삭제 실패: atchFileMngNo={}, fileSeq={}, msg={}", fiId, fiSn, e.getMessage());
		}
	}

	private String buildSubPath(String menuType) {
		if (menuType == null || menuType.isBlank()) {
			return "file/";
		}
		return switch (menuType.toLowerCase()) {
			case "popup" -> "popup/";
			case "banner" -> "banner/";
			case "product" -> "product/";
			case "category" -> "category/";
			case "educate" -> "educate/";
			case "edu-video" -> "edu-video/";
			case "edu-course" -> "edu-course/";
			case "exam-qbank" -> "exam-qbank/";
			case "schedule" -> "schedule/";
			case "bbs", "bbs_attach" -> "bbs/";
			case "hybrid-app-icon" -> "hybrid-app/icon/";
			case "hybrid-app-splash" -> "hybrid-app/splash/";
			default -> "file/";
		};
	}
}
