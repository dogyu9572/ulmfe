package egovframework.let.usr.service;

import java.nio.file.Path;
import java.util.List;

import egovframework.let.usr.service.vo.PublicFileInfoVO;

public interface EgovPublicFileService {
	List<PublicFileInfoVO> getFiles(String fileId);
	PublicFileInfoVO getFile(String fileId, int fileSeq);
	Path resolvePhysicalPath(PublicFileInfoVO fileInfo);
}
