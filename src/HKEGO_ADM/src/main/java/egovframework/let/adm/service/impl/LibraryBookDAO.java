package egovframework.let.adm.service.impl;

import egovframework.let.adm.service.vo.LibraryBookVO;
import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.springframework.stereotype.Repository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Repository("libraryBookDAO")
public class LibraryBookDAO extends EgovAbstractMapper {
	private static final String NS = "egovframework.let.adm.service.impl.LibraryBookDAO.";

	public int countLibraryBookList(
		String expsrYn,
		String rcmdtnYn,
		String rcmdtnClsfCd,
		String newBookYr,
		String newBookMm,
		String startRegYmd,
		String endRegYmd,
		String searchType,
		String searchKeyword
	) {
		Integer count = selectOne(NS + "countLibraryBookList", searchParam(
			expsrYn, rcmdtnYn, rcmdtnClsfCd, newBookYr, newBookMm, startRegYmd, endRegYmd, searchType, searchKeyword
		));
		return count == null ? 0 : count;
	}

	public List<LibraryBookVO> selectLibraryBookList(
		String expsrYn,
		String rcmdtnYn,
		String rcmdtnClsfCd,
		String newBookYr,
		String newBookMm,
		String startRegYmd,
		String endRegYmd,
		String searchType,
		String searchKeyword,
		int offset,
		int limit
	) {
		Map<String, Object> param = searchParam(
			expsrYn, rcmdtnYn, rcmdtnClsfCd, newBookYr, newBookMm, startRegYmd, endRegYmd, searchType, searchKeyword
		);
		param.put("offset", offset);
		param.put("limit", limit);
		return selectList(NS + "selectLibraryBookList", param);
	}

	public LibraryBookVO findById(Integer bookSn) {
		Map<String, Object> param = new HashMap<>();
		param.put("bookSn", bookSn);
		return selectOne(NS + "findById", param);
	}

	public LibraryBookVO findByBookMngNo(String bookMngNo) {
		Map<String, Object> param = new HashMap<>();
		param.put("bookMngNo", bookMngNo);
		return selectOne(NS + "findByBookMngNo", param);
	}

	public int insert(LibraryBookVO book) {
		return insert(NS + "insert", book);
	}

	public int update(LibraryBookVO book) {
		return update(NS + "update", book);
	}

	public int delete(Integer bookSn) {
		Map<String, Object> param = new HashMap<>();
		param.put("bookSn", bookSn);
		return update(NS + "delete", param);
	}

	public List<LibraryBookVO> selectRelatedBooks(Integer bookSn) {
		Map<String, Object> param = new HashMap<>();
		param.put("bookSn", bookSn);
		return selectList(NS + "selectRelatedBooks", param);
	}

	public int deleteRelatedBooks(Integer bookSn) {
		Map<String, Object> param = new HashMap<>();
		param.put("bookSn", bookSn);
		return delete(NS + "deleteRelatedBooks", param);
	}

	public int insertRelatedBook(Integer bookSn, Integer relBookSn, Integer sortSeq, String rgtr) {
		Map<String, Object> param = new HashMap<>();
		param.put("bookSn", bookSn);
		param.put("relBookSn", relBookSn);
		param.put("sortSeq", sortSeq);
		param.put("rgtr", rgtr);
		return insert(NS + "insertRelatedBook", param);
	}

	public List<LibraryBookVO> selectRelatedBookCandidates(
		Integer excludeBookSn,
		String searchType,
		String searchKeyword,
		int limit
	) {
		Map<String, Object> param = new HashMap<>();
		param.put("excludeBookSn", excludeBookSn);
		param.put("searchType", searchType);
		param.put("searchKeyword", searchKeyword);
		param.put("limit", limit);
		return selectList(NS + "selectRelatedBookCandidates", param);
	}

	private Map<String, Object> searchParam(
		String expsrYn,
		String rcmdtnYn,
		String rcmdtnClsfCd,
		String newBookYr,
		String newBookMm,
		String startRegYmd,
		String endRegYmd,
		String searchType,
		String searchKeyword
	) {
		Map<String, Object> param = new HashMap<>();
		param.put("expsrYn", expsrYn);
		param.put("rcmdtnYn", rcmdtnYn);
		param.put("rcmdtnClsfCd", rcmdtnClsfCd);
		param.put("newBookYr", newBookYr);
		param.put("newBookMm", newBookMm);
		param.put("startRegYmd", startRegYmd);
		param.put("endRegYmd", endRegYmd);
		param.put("searchType", searchType);
		param.put("searchKeyword", searchKeyword);
		return param;
	}
}
