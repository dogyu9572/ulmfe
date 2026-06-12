package egovframework.let.adm.service;

import java.nio.file.Path;
import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import egovframework.let.adm.service.vo.FileInfoVO;

public interface EgovFileInfoService {
	FileInfoVO uploadImageWithFileInfo(MultipartFile file, String menuType);
	FileInfoVO uploadImageWithFileInfo(MultipartFile file, String menuType, String existingFiId);
	FileInfoVO uploadPopupImage(MultipartFile file);
	FileInfoVO uploadAttachmentWithFileInfo(MultipartFile file, String menuType);
	FileInfoVO uploadAttachmentWithFileInfo(MultipartFile file, String menuType, String existingFiId);
	FileInfoVO getFileInfoById(String fiId);
	List<FileInfoVO> getFileInfoListById(String fiId);
	FileInfoVO getFileInfoByIdAndSn(String fiId, Integer fiSn);
	Path resolvePhysicalPath(FileInfoVO fileInfo);
	void deleteFileInfoByIdAndSn(String fiId, Integer fiSn);
}
