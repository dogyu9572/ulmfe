package egovframework.let.adm.service.impl;

import egovframework.let.adm.service.EgovLibraryBookService;
import egovframework.let.adm.service.vo.LibraryBookDto;
import egovframework.let.adm.service.vo.LibraryBookVO;
import egovframework.let.adm.service.vo.PageListResult;
import jakarta.annotation.Resource;
import org.egovframe.rte.fdl.cmmn.EgovAbstractServiceImpl;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;

@Service("egovLibraryBookService")
public class EgovLibraryBookServiceImpl extends EgovAbstractServiceImpl implements EgovLibraryBookService {
	private static final int MAX_RELATED_BOOK_COUNT = 4;

	@Resource(name = "libraryBookDAO")
	private LibraryBookDAO libraryBookDAO;

	public Map<String, Object> getLibraryBookListPage(
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
	) {
		int safePage = Math.max(1, page);
		int safeSize = Math.min(Math.max(1, size), 100);
		int offset = (safePage - 1) * safeSize;
		int totalCount = libraryBookDAO.countLibraryBookList(
			expsrYn, rcmdtnYn, rcmdtnClsfCd, newBookYr, newBookMm, startRegYmd, endRegYmd, searchType, searchKeyword
		);
		List<LibraryBookVO> list = libraryBookDAO.selectLibraryBookList(
			expsrYn, rcmdtnYn, rcmdtnClsfCd, newBookYr, newBookMm, startRegYmd, endRegYmd, searchType, searchKeyword,
			offset, safeSize
		);
		return PageListResult.of(list, totalCount, safePage, safeSize);
	}

	public LibraryBookVO getLibraryBookById(Integer bookSn) {
		LibraryBookVO book = libraryBookDAO.findById(bookSn);
		if (book == null) {
			throw new IllegalArgumentException("도서를 찾을 수 없습니다.");
		}
		book.setRelatedBooks(libraryBookDAO.selectRelatedBooks(bookSn));
		book.setRelatedBookSns(book.getRelatedBooks().stream().map(LibraryBookVO::getBookSn).toList());
		return book;
	}

	@Transactional
	public LibraryBookVO createLibraryBook(LibraryBookDto dto) {
		LibraryBookVO book = toBook(null, dto, "admin");
		LibraryBookVO sameNo = libraryBookDAO.findByBookMngNo(book.getBookMngNo());
		if (sameNo != null) {
			throw new IllegalArgumentException("이미 등록된 등록번호입니다.");
		}
		libraryBookDAO.insert(book);
		saveRelatedBooks(book.getBookSn(), dto.getRelatedBookSns(), "admin");
		return getLibraryBookById(book.getBookSn());
	}

	@Transactional
	public LibraryBookVO updateLibraryBook(Integer bookSn, LibraryBookDto dto) {
		LibraryBookVO existing = libraryBookDAO.findById(bookSn);
		if (existing == null) {
			throw new IllegalArgumentException("도서를 찾을 수 없습니다.");
		}
		LibraryBookVO sameNo = libraryBookDAO.findByBookMngNo(normalizeRequired(dto.getBookMngNo(), "등록번호"));
		if (sameNo != null && !sameNo.getBookSn().equals(bookSn)) {
			throw new IllegalArgumentException("이미 등록된 등록번호입니다.");
		}
		libraryBookDAO.update(toBook(bookSn, dto, "admin"));
		saveRelatedBooks(bookSn, dto.getRelatedBookSns(), "admin");
		return getLibraryBookById(bookSn);
	}

	@Transactional
	public void deleteLibraryBook(Integer bookSn) {
		LibraryBookVO existing = libraryBookDAO.findById(bookSn);
		if (existing == null) {
			throw new IllegalArgumentException("도서를 찾을 수 없습니다.");
		}
		libraryBookDAO.deleteRelatedBooks(bookSn);
		libraryBookDAO.delete(bookSn);
	}

	public List<LibraryBookVO> getRelatedBookCandidates(
		Integer excludeBookSn,
		String searchType,
		String searchKeyword,
		int limit
	) {
		int safeLimit = Math.min(Math.max(limit, 1), 100);
		return libraryBookDAO.selectRelatedBookCandidates(excludeBookSn, searchType, searchKeyword, safeLimit);
	}

	private LibraryBookVO toBook(Integer bookSn, LibraryBookDto dto, String adminId) {
		String bookMngNo = normalizeRequired(dto.getBookMngNo(), "등록번호");
		String bookNm = normalizeRequired(dto.getBookNm(), "도서명");
		String rcmdtnYn = yn(dto.getRcmdtnYn(), "N");
		String expsrYn = yn(dto.getExpsrYn(), "Y");
		String regYmd = normalize(dto.getRegYmd());
		LocalDate parsedRegYmd = regYmd == null ? LocalDate.now() : LocalDate.parse(regYmd);

		return LibraryBookVO.builder()
			.bookSn(bookSn)
			.bookMngNo(bookMngNo)
			.bookNm(bookNm)
			.bookImgAtchFileId(normalize(dto.getBookImgAtchFileId()))
			.autNm(normalize(dto.getAutNm()))
			.pblcoNm(normalize(dto.getPblcoNm()))
			.pblcnYr(normalizeYear(dto.getPblcnYr(), "발행년도"))
			.clno(normalize(dto.getClno()))
			.bookPstnNm(normalize(dto.getBookPstnNm()))
			.bookCn(normalize(dto.getBookCn()))
			.rcmdtnYn(rcmdtnYn)
			.rcmdtnClsfCd("Y".equals(rcmdtnYn) ? normalize(dto.getRcmdtnClsfCd()) : null)
			.rcmdtnSortSeq(dto.getRcmdtnSortSeq() == null ? 0 : dto.getRcmdtnSortSeq())
			.newBookYr(normalizeYear(dto.getNewBookYr(), "새로 들어온 도서 연도"))
			.newBookMm(normalizeMonth(dto.getNewBookMm()))
			.expsrYn(expsrYn)
			.regYmd(parsedRegYmd)
			.wrtrNm(normalize(dto.getWrtrNm()))
			.inqCnt(dto.getInqCnt() == null ? 0 : Math.max(0, dto.getInqCnt()))
			.rgtr(adminId)
			.mdtr(adminId)
			.build();
	}

	private void saveRelatedBooks(Integer bookSn, List<Integer> relatedBookSns, String adminId) {
		List<Integer> unique = new ArrayList<>(new LinkedHashSet<>(relatedBookSns == null ? List.of() : relatedBookSns));
		unique.removeIf(v -> v == null || v.equals(bookSn));
		if (unique.size() > MAX_RELATED_BOOK_COUNT) {
			throw new IllegalArgumentException("관련자료는 최대 4개까지 선택할 수 있습니다.");
		}
		libraryBookDAO.deleteRelatedBooks(bookSn);
		for (int i = 0; i < unique.size(); i++) {
			LibraryBookVO related = libraryBookDAO.findById(unique.get(i));
			if (related != null) {
				libraryBookDAO.insertRelatedBook(bookSn, related.getBookSn(), i + 1, adminId);
			}
		}
	}

	private String normalizeRequired(String value, String label) {
		String normalized = normalize(value);
		if (normalized == null) {
			throw new IllegalArgumentException(label + "을(를) 입력하세요.");
		}
		return normalized;
	}

	private String normalize(String value) {
		if (value == null || value.trim().isEmpty()) {
			return null;
		}
		return value.trim();
	}

	private String normalizeYear(String value, String label) {
		String normalized = normalize(value);
		if (normalized == null) {
			return null;
		}
		if (!normalized.matches("\\d{4}")) {
			throw new IllegalArgumentException(label + "는 4자리 연도로 입력하세요.");
		}
		return normalized;
	}

	private String normalizeMonth(String value) {
		String normalized = normalize(value);
		if (normalized == null) {
			return null;
		}
		if (!normalized.matches("\\d{1,2}")) {
			throw new IllegalArgumentException("새로 들어온 도서 월은 1~12월로 입력하세요.");
		}
		int month = Integer.parseInt(normalized);
		if (month < 1 || month > 12) {
			throw new IllegalArgumentException("새로 들어온 도서 월은 1~12월로 입력하세요.");
		}
		return String.format("%02d", month);
	}

	private String yn(String value, String defaultValue) {
		return "Y".equalsIgnoreCase(value) ? "Y" : "N".equalsIgnoreCase(value) ? "N" : defaultValue;
	}
}
