package egovframework.let.usr.service.impl;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.springframework.stereotype.Repository;

import egovframework.let.usr.service.vo.PublicFileInfoVO;

@Repository("publicFileDAO")
public class PublicFileDAO extends EgovAbstractMapper {
	private static final String NS = "egovframework.let.usr.service.impl.PublicFileDAO.";

	public List<PublicFileInfoVO> selectFiles(String fileId) {
		return selectList(NS + "selectFiles", fileId);
	}

	public PublicFileInfoVO selectFile(String fileId, int fileSeq) {
		Map<String, Object> params = new HashMap<>();
		params.put("fileId", fileId);
		params.put("fileSeq", fileSeq);
		return selectOne(NS + "selectFile", params);
	}
}
