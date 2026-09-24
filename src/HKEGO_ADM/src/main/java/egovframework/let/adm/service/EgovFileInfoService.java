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
	/**
	 * 파일 그룹 하나를 통째로 정리한다(메타 + 실물).
	 * 콘텐츠를 지워도 파일이 남으면 주소를 아는 사람이 계속 내려받을 수 있어, 삭제 시 함께 호출한다.
	 * 값이 비었거나 이미 없으면 조용히 넘어가고, 정리 실패가 본 삭제를 되돌리지는 않는다.
	 */
	void deleteFileGroup(String atchFileMngNo);
}
