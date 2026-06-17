package egovframework.let.adm.service;

import egovframework.let.adm.service.vo.LibraryBookDto;
import egovframework.let.adm.service.vo.LibraryBookVO;

import java.util.List;
import java.util.Map;

public interface EgovLibraryBookService {
	Map<String, Object> getLibraryBookListPage(
		String expsrYn,
		String rcmdtnYn,
		String rcmdtnClsfCd,
		String newBookYr,
		String newBookMm,
		String startRegYmd,
		String endRegYmd,
		String searchType,
		String searchKeyword,
		int page,
		int size
	);

	LibraryBookVO getLibraryBookById(Integer bookSn);

	LibraryBookVO createLibraryBook(LibraryBookDto dto);

	LibraryBookVO updateLibraryBook(Integer bookSn, LibraryBookDto dto);

	void deleteLibraryBook(Integer bookSn);

	List<LibraryBookVO> getRelatedBookCandidates(
		Integer excludeBookSn,
		String searchType,
		String searchKeyword,
		int limit
	);
}
