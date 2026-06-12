package egovframework.let.adm.service.impl;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.springframework.stereotype.Repository;

import egovframework.let.adm.service.vo.FileInfoVO;

@Repository("fileInfoDAO")
public class FileInfoDAO extends EgovAbstractMapper {
	private static final String NS = "egovframework.let.adm.service.impl.FileInfoDAO.";

	public int insertFileInfo(FileInfoVO fileInfo) {
		return insert(NS + "insertFileInfo", fileInfo);
	}

	public FileInfoVO selectFileInfoById(String atchFileMngNo) {
		Map<String, Object> param = new HashMap<>();
		param.put("atchFileMngNo", atchFileMngNo);
		return selectOne(NS + "selectFileInfoById", param);
	}

	public List<FileInfoVO> selectFileInfoListById(String atchFileMngNo) {
		Map<String, Object> param = new HashMap<>();
		param.put("atchFileMngNo", atchFileMngNo);
		return selectList(NS + "selectFileInfoListById", param);
	}

	public FileInfoVO selectFileInfoByIdAndSn(String atchFileMngNo, Integer fileSeq) {
		Map<String, Object> param = new HashMap<>();
		param.put("atchFileMngNo", atchFileMngNo);
		param.put("fileSeq", fileSeq);
		return selectOne(NS + "selectFileInfoByIdAndSn", param);
	}

	public Integer selectMaxFiSnById(String atchFileMngNo) {
		Map<String, Object> param = new HashMap<>();
		param.put("atchFileMngNo", atchFileMngNo);
		return selectOne(NS + "selectMaxFiSnById", param);
	}

	public int deleteFileInfoByIdAndSn(String atchFileMngNo, Integer fileSeq) {
		Map<String, Object> param = new HashMap<>();
		param.put("atchFileMngNo", atchFileMngNo);
		param.put("fileSeq", fileSeq);
		return delete(NS + "deleteFileInfoByIdAndSn", param);
	}
}
