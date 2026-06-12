package egovframework.let.adm.service.impl;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.springframework.stereotype.Repository;

import egovframework.let.adm.service.vo.PopupVO;

@Repository("popupDAO")
public class PopupDAO extends EgovAbstractMapper {
	private static final String NS = "egovframework.let.adm.service.impl.PopupDAO.";

	public int selectPopupCount(
		String useYn, String startPublishDate, String endPublishDate,
		String startRegDate, String endRegDate, String searchType, String searchKeyword
	) {
		Map<String, Object> param = new HashMap<>();
		param.put("useYn", useYn);
		param.put("startPublishDate", startPublishDate);
		param.put("endPublishDate", endPublishDate);
		param.put("startRegDate", startRegDate);
		param.put("endRegDate", endRegDate);
		param.put("searchType", searchType);
		param.put("searchKeyword", searchKeyword);
		Integer count = selectOne(NS + "selectPopupCount", param);
		return count == null ? 0 : count;
	}

	public List<PopupVO> selectPopupList(
		String useYn, String startPublishDate, String endPublishDate,
		String startRegDate, String endRegDate, String searchType, String searchKeyword,
		int offset, int limit
	) {
		Map<String, Object> param = new HashMap<>();
		param.put("useYn", useYn);
		param.put("startPublishDate", startPublishDate);
		param.put("endPublishDate", endPublishDate);
		param.put("startRegDate", startRegDate);
		param.put("endRegDate", endRegDate);
		param.put("searchType", searchType);
		param.put("searchKeyword", searchKeyword);
		param.put("offset", offset);
		param.put("limit", limit);
		return selectList(NS + "selectPopupList", param);
	}

	public PopupVO selectPopupById(Long popupSn) {
		Map<String, Object> param = new HashMap<>();
		param.put("popupSn", popupSn);
		return selectOne(NS + "selectPopupById", param);
	}

	public int insertPopup(PopupVO popup) {
		return insert(NS + "insertPopup", popup);
	}

	public int updatePopup(PopupVO popup) {
		return update(NS + "updatePopup", popup);
	}

	public int deletePopup(Long popupSn, String deltr) {
		Map<String, Object> param = new HashMap<>();
		param.put("popupSn", popupSn);
		param.put("deltr", deltr);
		return update(NS + "deletePopup", param);
	}
}
