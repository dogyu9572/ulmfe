package egovframework.let.adm.service;

import org.springframework.web.multipart.MultipartFile;

public interface EgovFileUploadService {
	String saveFile(MultipartFile file, String menuType, String menuId);
}
