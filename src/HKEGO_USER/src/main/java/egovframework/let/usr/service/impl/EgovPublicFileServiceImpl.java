package egovframework.let.usr.service.impl;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import egovframework.let.usr.service.EgovPublicFileService;
import egovframework.let.usr.service.vo.PublicFileInfoVO;
import lombok.RequiredArgsConstructor;

@Service("egovPublicFileService")
@RequiredArgsConstructor
public class EgovPublicFileServiceImpl implements EgovPublicFileService {
	private final PublicFileDAO publicFileDAO;

	@Value("${file.upload.path}")
	private String uploadPath;

	@Override
	public List<PublicFileInfoVO> getFiles(String fileId) {
		if (fileId == null || fileId.isBlank()) return List.of();
		return publicFileDAO.selectFiles(fileId.trim());
	}

	@Override
	public PublicFileInfoVO getFile(String fileId, int fileSeq) {
		if (fileId == null || fileId.isBlank() || fileSeq < 0) return null;
		return publicFileDAO.selectFile(fileId.trim(), fileSeq);
	}

	@Override
	public Path resolvePhysicalPath(PublicFileInfoVO fileInfo) {
		if (fileInfo == null || fileInfo.getFileUrl() == null || fileInfo.getFileUrl().isBlank()) {
			throw new IllegalArgumentException("파일 경로가 없습니다.");
		}
		String relativePath = fileInfo.getFileUrl().trim();
		if (relativePath.startsWith("/uploads/")) {
			relativePath = relativePath.substring("/uploads/".length());
		}
		Path basePath = Paths.get(uploadPath).toAbsolutePath().normalize();
		Path resolved = basePath.resolve(relativePath).normalize();
		if (!resolved.startsWith(basePath)) {
			throw new IllegalArgumentException("허용되지 않은 파일 경로입니다.");
		}
		if (!Files.isRegularFile(resolved)) {
			throw new IllegalArgumentException("파일을 찾을 수 없습니다.");
		}
		return resolved;
	}
}
